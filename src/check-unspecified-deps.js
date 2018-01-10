import ora from 'ora'
import fs from 'fs-extra'
import glob from 'glob-promise'
import getPjson from './get-package-json'

const depCheck = (str, obj) => !obj.hasOwnProperty(str)

const dependencies = []
const unspecifiedDeps = []

export default async dir => {
  const undepSpinner = ora(`Check missing dependencies`).start()

  const globOpt = {
    ignore: ['**/node_modules/**'],
    cwd: dir,
    realpath: true
  }

  const jsFiles = await glob('**/*.js', globOpt)

  for (const js of jsFiles) {
    const codes = await fs.readFile(js, 'utf8')
    const re = /(?:from |require\()'([^/.][^/]*?)'/g
    const matches = codes.match(re) ? codes.match(re).map(e => e.replace(re, '$1')) : []

    for (const obj of matches) {
      if (!dependencies.includes(obj)) {
        dependencies.push(obj)
      }
    }
  }

  for (const dep of dependencies) {
    if (depCheck(dep, await getPjson(dir))) {
      unspecifiedDeps.push(dep)
    }
  }

  undepSpinner.succeed()

  return {
    deps: dependencies,
    unspecifiedDeps
  }
}

