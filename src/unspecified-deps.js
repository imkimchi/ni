import {exec} from 'child-process-promise'
import chalk from 'chalk'
import ora from 'ora'

import successMsg from './success'
import npm from './npm'

const colored = (color, msg) => console.log(chalk[color](msg))

async function getLatest(dep) {
  const res = await exec(`npm show ${dep} version`)
  return res.stdout.replace('\n', '')
}

export default async (dependencies, unspecifiedDeps, dir) => {
  const unDepInstallSpinner = ora('Installing Missing Dependencies').start()

  try {
    const npmOpt = {
      cwd: dir,
      save: true
    }

    await npm.install(unspecifiedDeps, npmOpt)
    unDepInstallSpinner.succeed()

    colored('blue', '\nInstalled Missing Dependencies:\n')
    for (const dep of unspecifiedDeps) {
      console.log(`${chalk.bold(dep)}${chalk.hex('#EC407A').bold('@')}${await getLatest(dep)} ${chalk.green('✔︎')}`)
    }

    successMsg(dependencies.length + unspecifiedDeps.length)
  } catch (err) {
    console.error(`${chalk.redBright('Failed:')} ${err}`)
  }
}
