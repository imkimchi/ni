import { exec } from 'child-process-promise'
import successMsg from './success'
import chalk from 'chalk'
import npm from './npm'
import ora from 'ora'

const colored = (color, msg) => console.log(chalk[color](msg))

async function getLatest (dep) {
  const res = await exec(`npm show ${dep} version`)
  return res.stdout.replace('\n', '')
}

export default async (dependencies, unspecifiedDeps, directory) => {
  const unDepInstallSpinner = ora('Installing Unspecified Dependencies').start()

  try {
      const npmOpt = {
          cwd: directory,
          save: true
      }
      
      await npm.install(unspecifiedDeps, npmOpt)
      unDepInstallSpinner.succeed()

      colored('blue', '\nInstalled Unspecified Dependencies:\n')
      for(let dep of unspecifiedDeps) {
          console.log(`${chalk.bold(dep)}${chalk.hex('#EC407A').bold('@')}${await getLatest(dep)} ${chalk.green('✔︎')}`)
      }

      successMsg(dependencies.length + unspecifiedDeps.length)
  } catch (err) {
      console.error(`${chalk.redBright('Failed:')} ${err}`)
  }
}