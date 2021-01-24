import { extname } from "path"

/**
 * @param {string} p
 * @returns {[string, string]}
 */
export function splitExt (p) {
  const ext = extname(p)
  const filename = p.slice(0, p.length - ext.length)
  return [filename, ext]
}
