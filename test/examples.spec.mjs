/* global before describe it */
import fs from "fs-extra"
import os from "os"
import pathModule from "path"
import { AssertionError, deepStrictEqual } from "assert"
import { dirname } from "path"
import { fileURLToPath } from "url"
import { groupBy } from "lodash-es"

import { ExamplesParser as ExamplesParser2 } from "./ExamplesParser.mjs"
import { runEslint } from "./eslintRunner.mjs"
import { splitExt } from "./utils.mjs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const ROOT_DIR = pathModule.join(__dirname, "..")
const EXAMPLES_DIR = pathModule.join(ROOT_DIR, "examples")

/**
 * Dynamically generate test-cases for the examples folder
 */
describe("examples", function () {
  this.timeout(10000)
  const examplesObj = new ExamplesParser2(EXAMPLES_DIR)
  let tmpRoot = undefined

  before(async () => {
    tmpRoot = await getTmp()
    await ensureSymlinks(ROOT_DIR, tmpRoot)
    writeExamplesToTmp(examplesObj.getExamples())
  })

  /**
   * @param {Array.<Example>} examples
   */
  function writeExamplesToTmp (examples) {
    let filtered = examples.filter(el => el.only)
    if (!filtered.length) filtered = examples
    filtered.forEach(el => {
      fs.outputFileSync(getTmpExamplesPath(el), el.code)
    })
  }

  /**
   * @param {Example} example
   * @param {string} preset
   */
  function getEslintPath (example, preset) {
    return pathModule.join(tmpRoot, `${example.flattenedName}-${preset}-eslintrc.js`)
  }

  /**
   * @param {Example} example
   */
  function getTmpExamplesPath (example) {
    return pathModule.join(tmpRoot, example.flattenedName)
  }

  /**
   * @param {string} preset
   * @param {Array.<Example>} examples
   */
  function createTestcaseForPreset (preset, examples) {
    describe(preset, () => {
      before(async () => {
        await Promise.all(examples.map(async el => {
          const eslintrcPath = getEslintPath(el, preset)
          const content = await createEslintrcContent(preset, ROOT_DIR)
          return fs.outputFile(eslintrcPath, content)
        }))
      })
      for (const [category, examplesInCategory] of Object.entries(groupBy(examples, "inferredCategory"))) {
        const testcaseFactory = testcasesFactories[category]
        if (!testcaseFactory) {
          console.warn(`No testcase factory for: ${preset}/${category}, ignoring files: ${examplesInCategory.map(ex => ex.sourcePath)}`)
          continue
        }
        testcaseFactory(preset, examplesInCategory)
      }
    })
  }

  const testcasesFactories = {
    "valid": createValidTestcases,
    "invalid": createInvalidTestcases,
  }

  /**
   * @param {string} preset
   * @param {Array.<Example>} examples
   */
  function createValidTestcases (preset, examples) {
    describe("valid", () => {
      for (const el of examples) {
        const it_ = el.only ? it.only : it
        it_(`${el.inferredName} should have no errors (${el.inferredPreset})`, async () => {
          const filePath = getTmpExamplesPath(el)
          const eslintrcPath = getEslintPath(el, preset)
          const parsedStdout = await runEslint(eslintrcPath, filePath, { cwd: tmpRoot })
          deepStrictEqual(parsedStdout, {
            filePath,
            messages: [],
            errorCount: 0,
            warningCount: 0,
            fixableErrorCount: 0,
            fixableWarningCount: 0,
            usedDeprecatedRules: [],
          })
        })
      }
    })
  }

  /**
   * @param {string} preset
   * @param {Array.<Example>} examples
   */
  function createInvalidTestcases (preset, examples) {
    describe("invalid", () => {
      for (const el of examples) {
        const it_ = el.only ? it.only : it

        if (el.code && el.errors) {
          it_(`${el.inferredName} should cause expected errors (${el.inferredPreset})`, async () => {
            const filePath = getTmpExamplesPath(el)
            const eslintrcPath = getEslintPath(el, preset)
            const parsedStdout = await runEslint(eslintrcPath, filePath, { cwd: tmpRoot })
            deepStrictEqualViaEslint(parsedStdout.filePath, filePath, filePath)
            deepStrictEqualViaEslint(parsedStdout.messages, el.errors, filePath)
            deepStrictEqualViaEslint(parsedStdout.usedDeprecatedRules, [], filePath)
          })
        }

        if (el.code && el.output) {
          it_(`${el.inferredName} should --fix correctly (${el.inferredPreset})`, async () => {
            const filePath = getTmpExamplesPath(el)
            const eslintrcPath = getEslintPath(el, preset)
            const parsedStdout = await runEslint(eslintrcPath, filePath, { cwd: tmpRoot, fix: true })
            deepStrictEqualViaEslint(parsedStdout.output, el.output, filePath)
          })
        }
      }
    })
  }

  createTestcaseForPreset("ts", examplesObj.getExamplesForPreset("ts"))
  createTestcaseForPreset("tsReact", examplesObj.getExamplesForPreset("tsReact"))
})

function deepStrictEqualViaEslint (actual, expected, filepath) {
  try {
    deepStrictEqual(actual, expected)
  } catch (err) {
    if (err instanceof AssertionError) {
      err.message = `ESLint failed on file: ${filepath}\n${err.message}`
      throw err
    }
    throw err
  }
}

async function ensureSymlinks (sourceDir, targetDir) {
  await fs.ensureSymlink(pathModule.join(sourceDir, "package.json"), pathModule.join(targetDir, "package.json"))
  await fs.ensureSymlink(pathModule.join(sourceDir, "node_modules"), pathModule.join(targetDir, "node_modules"))
}

async function getTmp () {
  let tmpPath = pathModule.resolve(
    os.tmpdir(),
    "domineer.ts",
    pathModule.basename(splitExt(__filename)[0]),
  )
  await fs.emptyDir(tmpPath)
  return tmpPath
}

/**
 * Create eslintrc content
 *
 * @param {("ts"|"tsReact")} preset
 * @param {string} cwd
 */
async function createEslintrcContent (preset, cwd) {
  const ESLINTRC_SETTINGS = {
    ts: {
      extends: pathModule.join(ROOT_DIR, "ts"),
    },
    tsReact: {
      extends: pathModule.join(ROOT_DIR, "tsReact"),
      settings: { jest: { version: "latest" } },
    },
  }

  const config = ESLINTRC_SETTINGS[preset]
  config.extends = pathModule.resolve(cwd, config.extends)
  return `module.exports = ${JSON.stringify(config, null, 2)}\n`
}
