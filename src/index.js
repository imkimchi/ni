#!/usr/bin/env node
import 'babel-polyfill';

import { exec } from 'child-process-promise'
import npm from './lib/npm'
import fs from 'fs-extra'
import chalk from 'chalk'

const replaceMsg = e => e === 'No packages found' && `There's no uninstalled dependency`
const depCheck = (str,obj) => (!str.startsWith('./') && !obj.hasOwnProperty(str))
const checkExtension = file => file.includes('.js') ? file : `${file}.js`

const colored = (color, msg) => console.log(chalk[color](msg))
const identifyPath = () => process.argv[3]


let dependencies = []
let uninstalledDeps = []
let argv = process.argv

;(async () => {
    let directory = identifyPath() ? process.argv[3] : process.cwd()
    let targetFile = checkExtension(argv[2])
    let actualPath = `${directory}/${targetFile}`
    let texts = await fs.readFile(actualPath, "utf8")
    let codeArray = texts.split('\n')
    let re = /require\('(.*)'\)/

    for(let line of codeArray) {
        if(re.test(line)) dependencies.push(line.match(re)[1])
    }

    let packagePath = `${directory}/package.json`
    let installedDeps = await fs.readJSON(packagePath)

    for(let dep of dependencies) {
        if(depCheck(dep, installedDeps.dependencies)) {
            uninstalledDeps.push(dep)
        }
    }

    try {
        let npmOpt = {
          cwd: directory,
          save: true
        }

        await npm.install(uninstalledDeps, npmOpt)
        colored("Uninstalled dependencies download complete !", 'magenta')
        for(let dep of uninstalledDeps) {
            console.log(`${chalk.gray(dep)}@${getLatest(dep)} ${chalk.green('✔︎')}\n`)
        }
    } catch (e) {
        let fixedMsg = replaceMsg(e)
        console.log(`${chalk.redBright('Failed:')} ${fixedMsg}`)
    }

    
    async function getLatest (dep) {
        let res = await exec(`npm show ${dep} version`)
        return res.stdout.replace('\n', "")
    }
})()