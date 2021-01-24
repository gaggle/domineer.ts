import fs from "fs-extra"
import { groupBy } from "lodash-es"
import pathModule from "path"

import { splitExt } from "./utils.mjs"

/**
 * @typedef Example
 * @type {object}
 * @property {string} inferredCategory
 * @property {string} inferredName
 * @property {string} inferredPreset
 * @property {boolean} only
 * @property {string} sourcePath
 * @property {string} flattenedName
 * @property {string} code
 * @property {string} output
 * @property {Array} options
 * @property {Array.<Error>} errors
 */

/**
 * @typedef Error
 * @type {object}
 * @property {string} message
 * @property {number} line
 * @property {number} column
 * @property {number} endLine
 * @property {number} endColumn
 */

export class ExamplesParser {
  constructor (dir) {
    this.dir = dir
    this.examples = this._parseExamples()
  }

  /**
   * @returns {Array.<Example>}
   */
  getExamples () {
    return this.examples
  }

  /**
   * @param {"tsReact"|string} preset
   * @returns {Array.<Example>}
   */
  getExamplesForPreset (preset) {
    const grouped = groupBy(this.examples, "inferredPreset")
    switch (preset) {
      case "tsReact":
        return grouped["tsReact"].concat(grouped["ts"])
      default:
        return grouped["ts"]
    }
  }

  _parseExamples () {
    const examples = []
    for (const examplePath of walk(this.dir)) {
      const sourcePath = pathModule.join(this.dir, examplePath)
      const folders = examplePath.split(pathModule.sep)
      const filename = folders.pop()
      const [filenameWithoutExt, ext] = splitExt(filename)
      const inferredPreset = folders[0]
      const inferredCategory = folders[1]
      const inferredName = filename

      const onlyMatch = filename.match(/only\.tsx?/)

      let configuration = {
        inferredCategory,
        inferredName,
        inferredPreset,
        only: !!onlyMatch,
        sourcePath,
      }
      switch (ext) {
        case ".txt":
          configuration = {
            ...configuration,
            flattenedName: `${folders.join(".")}.${filenameWithoutExt}`,
            ...(parseTxtExample(sourcePath)),
          }
          break
        default:
          configuration = {
            ...configuration,
            flattenedName: `${folders.join(".")}.${filenameWithoutExt}${ext}`,
            code: fs.readFileSync(sourcePath).toString(),
          }
          break
      }
      examples.push(configuration)
    }
    return examples
  }
}

function parseTxtExample (filepath) {
  const content = fs.readFileSync(filepath).toString()
  const el = {}

  let re
  if (content.includes("OPTIONS:") && content.includes("OUTPUT:")) {
    re = new RegExp(
      "(?:CODE:\\n)(?<code>(.|\\n)*)"
      + "(?:\n(OUTPUT:\\n)(?<output>(.|\\n)*))"
      + "(?:\n(OPTIONS:\\n)(?<options>(.|\\n)*))"
      + "(?:\n(ERRORS:\\n)(?<errors>(.|\\n)*))",
      "m",
    )
  } else if (content.includes("OPTIONS:")) {
    re = new RegExp(
      "(?:CODE:\\n)(?<code>(.|\\n)*)"
      + "(?:\n(OPTIONS:\\n)(?<options>(.|\\n)*))"
      + "(?:\n(ERRORS:\\n)(?<errors>(.|\\n)*))",
      "m",
    )
  } else if (content.includes("OUTPUT:")) {
    re = new RegExp(
      "(?:CODE:\\n)(?<code>(.|\\n)*)"
      + "(?:\n(OUTPUT:\\n)(?<output>(.|\\n)*))"
      + "(?:\n(ERRORS:\\n)(?<errors>(.|\\n)*))",
      "m",
    )
  } else {
    re = new RegExp(
      "(?:CODE:\\n)(?<code>(.|\\n)*)"
      + "(?:\n(ERRORS:\\n)(?<errors>(.|\\n)*))",
      "m",
    )
  }

  const m = content.match(re)
  if (m === null) throw new Error(`Malformed example: ${filepath}`)

  el.code = m.groups.code
  el.output = m.groups.output
  if (m.groups.options) {
    try {
      el.options = JSON.parse(m.groups.options)
    } catch (err) {
      throw new Error(`Could not parse 'OPTIONS' section\nError message: ${err.message}\nErrors section:${m.groups.output}`)
    }
  }
  try {
    el.errors = JSON.parse(m.groups.errors)
  } catch (err) {
    throw new Error(`Could not parse 'ERRORS' section\nError message: ${err.message}\nErrors section:${m.groups.errors}`)
  }

  return el
}

function walk (dir, ...ignorePatterns) {
  function innerWalk (innerDir) {
    const dirFiles = fs.readdirSync(innerDir)
    const files = dirFiles.map(file => {
      const filePath = pathModule.join(innerDir, file)
      for (const x of ignorePatterns) {
        const match = filePath.match(x)
        if (match) { return }
      }
      const stats = fs.statSync(filePath)
      if (stats.isDirectory()) { return innerWalk(filePath) } else if (stats.isFile()) { return filePath }
    })
    return files
      .reduce((all, folderContents) => all.concat(folderContents), [])
      .filter((el) => !!el)
  }

  return (innerWalk(dir))
    .map((el) => pathModule.relative(dir, el))
    .sort()
}
