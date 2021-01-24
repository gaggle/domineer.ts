/* global before describe it */
import { deepStrictEqual } from "assert"
import { dirname, join } from "path"
import { fileURLToPath } from "url"

import { ExamplesParser } from "./ExamplesParser.mjs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

describe("ExamplesParser", () => {
  const fixturesDir = join(__dirname, "fixtures")

  describe("#getExamples", () => {
    const testcases = {
      "parser": {
        code: "code\n",
        errors: [],
        options: [],
        output: "output\n",
        only: false,
        flattenedName: "preset.category.example.ts",
        inferredCategory: "category",
        inferredName: "example.ts.txt",
        inferredPreset: "preset",
        sourcePath: join(fixturesDir, "parser/preset/category/example.ts.txt"),
      },
      "parser-no-options": {
        code: "code\n",
        errors: [],
        output: "output\n",
      },
      "parser-no-options-and-no-output": {
        code: "code\n",
        errors: [],
      },
      "parser-no-output": {
        code: "code\n",
        errors: [],
        options: [],
      },
      "parser-only": {
        only: true,
      },
    }
    for (const [fixture, checker] of Object.entries(testcases)) {
      describe(`when it parses fixture '${fixture}'`, () => {
        let example
        before(() => {
          const fixtureDir = join(fixturesDir, fixture)
          const parser = new ExamplesParser(fixtureDir)
          example = parser.getExamples()[0]
        })
        for (const [key, expected] of Object.entries(checker)) {
          if (expected === undefined) {
            it(`should have an undefined '${key}' property`, () => {
              deepStrictEqual(example[key], undefined)
            })
          } else {
            it(`should have the expected '${key}' property`, () => {
              deepStrictEqual(example[key], expected)
            })
          }
        }
      })
    }
  })

  describe("#getExamplesForPreset", () => {
    let examples
    let fixtureDir
    before(() => {
      fixtureDir = join(fixturesDir, "parser-tsReact-concats-ts")
      const parser = new ExamplesParser(fixtureDir)
      examples = parser.getExamples()
    })

    it("should return tsReact + ts examples when asking for tsReact preset", () => {
      deepStrictEqual(examples.map(el => el.sourcePath), [
        join(fixtureDir, "ts/category/example.ts"),
        join(fixtureDir, "tsReact/category/example.ts"),
      ])
    })
  })
})
