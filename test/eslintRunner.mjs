import execa from "execa"

export async function runEslint (eslintrcPath, path, opts = {}) {
  const cwd = opts.cwd
  const fix = opts.fix || false
  const p = await safeExecaCommand(
    `npx eslint ${fix ? "--fix-dry-run" : ""} --no-eslintrc --format=json -c ${eslintrcPath} ${path}`,
    { cwd })
  return parseLintOutput(p)[0]
}

function parseLintOutput (execaChildProcess) {
  try {
    return JSON.parse(execaChildProcess.stdout)
  } catch (err) {
    throw new Error(`Error parsing output: ${err.message}, ` +
      `full output: ${execaChildProcess.stdout}\n${execaChildProcess.stderr}`)
  }
}

async function safeExecaCommand (...args) {
  try {
    // console.debug(...args)
    return await execa.command.call(this, ...args)
  } catch (err) {
    return err
  }
}
