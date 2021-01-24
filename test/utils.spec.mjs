/* global describe it */
import { deepStrictEqual } from "assert"

import { splitExt } from "./utils.mjs"

describe("splitExt", () => {
  it("returns filename and ext", () => {
    deepStrictEqual(splitExt("foo.bar.baz"), ["foo.bar", ".baz"])
  })
})
