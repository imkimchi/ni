import ora from 'ora'
import fs from 'fs-extra'
import getPjson from './get-package-json'

const checkExtension = file => file.includes('.js') ? file : `${file}.js`
const depCheck = (str, obj) => (!str.startsWith('./') && !obj.hasOwnProperty(str))

export default async (dir, filename) => {
  const undepSpinner = ora("Check if there's unspecified dependencies")
  const targetFile = checkExtension(filename)
  const actualPath = `${dir}/${targetFile}`
  const texts = await fs.readFile(actualPath, 'utf8')
  const codeArray = texts.split('\n')
  const re = /require\('(.*)'\)/

  const dependencies = []
  const unspecifiedDeps = []

  for (let line of codeArray) {
      if (re.test(line)) dependencies.push(line.match(re)[1])
  }
  for (let dep of dependencies) {
      if (depCheck(dep, await getPjson(dir))) {
          unspecifiedDeps.push(dep)
      }
  }
  undepSpinner.succeed()

  return {
    deps: dependencies,
    unspecifiedDeps: unspecifiedDeps
  }
}

