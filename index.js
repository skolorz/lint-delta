/* eslint no-console: "off" */

const fs = require('fs')
const { execSync } = require('child_process')
const CLIEngine = require('eslint').CLIEngine
const cli = new CLIEngine({
  cwd: '.',
  cache: true
})
const formatter = cli.getFormatter()

let files = execSync('git diff origin/master --name-only')
  .toString()
  .split('\n')
  .filter(f => f.match(/.+\.js$/))
  .filter(f => fs.existsSync(f))

console.log(files.length + ' files to lint:')
console.log(files.join('\n'))

let report = cli.executeOnFiles(files)
report.results = CLIEngine.getErrorResults(report.results)
const output = formatter(report.results)

if (output) {
  console.log(output)
} else {
  console.log('OK')
}

if (report.errorCount) {
  process.exit(1)
}
