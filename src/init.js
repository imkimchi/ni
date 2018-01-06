import getPkgCounts from './get-pkg-counts'
import npm from './npm'
import getPjson from './get-package-json'

export default async (dir, depSpinner) => {
  const depsArray = Object.keys(await getPjson(dir))

  try {
    await npm.install(depsArray, {cwd: dir})
  } catch (err) {
    console.error('Failed to run npm install', err)
  }

  depSpinner.succeed()
  return getPkgCounts(dir)
}
