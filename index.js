/* eslint no-console: "off" */

const fs = require('fs')
const { execSync } = require('child_process')
const CLIEngine = require('eslint').CLIEngine
const fix = !!(process.argv.find(p => p === '--fix'))
const cli = new CLIEngine({
  cwd: '.',
  fix: fix,
  cache: true
})
const formatter = cli.getFormatter()

let refbranch = 'origin/develop'
let branchIndex = process.argv.findIndex(p => p === '--branch')
if (branchIndex > -1 && process.argv[branchIndex + 1]) {
  refbranch = process.argv[branchIndex + 1]
}

let files = execSync(`git diff ${refbranch} --name-only`)
  .toString()
  .split('\n')
  .filter(f => f.match(/.+\.js$/))
  .filter(f => fs.existsSync(f))

console.log(files.length + ' files to lint:')
console.log(files.join('\n'))

let report = cli.executeOnFiles(files)

if (fix) {
  report.results
    .filter(f => f.output)
    .forEach(f => fs.writeFileSync(f.filePath, f.output))
}

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
