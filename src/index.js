#!/usr/bin/env node
import 'babel-polyfill'

import { exec } from 'child-process-promise'
import npm from '../lib/npm'
import fs from 'fs-extra'
import chalk from 'chalk'
import ora from 'ora'

const depCheck = (str,obj) => (!str.startsWith('./') && !obj.hasOwnProperty(str))
const checkExtension = file => file.includes('.js') ? file : `${file}.js`
const colored = (color, msg) => console.log(chalk[color](msg))
const successMsg = pkgs => console.log(`\nInstalled ${pkgs} packages successfully 🎉`)

let directory = process.argv[3] || process.cwd()
let dependencies = []
let unspecifiedDeps = []
let modsBeforeInstall,
    modsAfterInstall

;(async () => {
    console.log(`\n📦  ni, ${chalk.bold('A better npm install')} \n`)
    const depSpinner = ora('Installing Dependencies').start()
    
    modsBeforeInstall = await checkMods(directory)

    //initial npm install
    if(!modsBeforeInstall.length) {
        await initialInstall(directory, depSpinner)
    }
    
    //if there's unspecified Dependencies exist
    if(unspecifiedDeps.length) unSpecifiedDepsInstall(directory)
    else noUnsDepsHandler (modsBeforeInstall, modsAfterInstall)
})()

async function checkMods (dir) {
    try {
        let modArr = await fs.readdir(`${directory}/node_modules`)
        return modArr.length
    } catch (e) {
        return 0
    }
}

async function getLatest (dep) {
    let res = await exec(`npm show ${dep} version`)
    return res.stdout.replace('\n', '')
}

async function initialInstall(directory, depSpinner) {
    let targetFile = checkExtension(process.argv[2])
    let actualPath = `${directory}/${targetFile}`
    let texts = await fs.readFile(actualPath, 'utf8')
    let packagePath = `${directory}/package.json`
    let specifiedDeps = await fs.readJSON(packagePath)
    let depsArray = Object.keys(specifiedDeps.dependencies)
    let codeArray = texts.split('\n')
    let re = /require\('(.*)'\)/

    try {
        await npm.install(depsArray, {cwd: directory})
    } catch (e) {
        console.error("Failed to run npm install", e)
    }
    
    modsAfterInstall = await checkMods(directory)
    depSpinner.succeed()

    let undepSpinner = ora("Check if there's unspecified dependencies")

    for(let line of codeArray) {
        if(re.test(line)) dependencies.push(line.match(re)[1])
    }
    for(let dep of dependencies) {
        if(depCheck(dep, specifiedDeps.dependencies)) {
            unspecifiedDeps.push(dep)
        }
    }
    undepSpinner.succeed()
}

async function unSpecifiedDepsInstall (directory){
    let unDepInstallSpinner = ora('Installing Unspecified Dependencies').start()

    try {
        let npmOpt = {
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
    } catch (e) {
        console.error(`${chalk.redBright('Failed:')} ${e}`)
    }
}

//No unspecified dependencies Handler
async function noUnsDepsHandler (modsBeforeInstall, modsAfterInstall) {
    if(modsBeforeInstall < modsAfterInstall) {
        //when successfully run initial npm install without unspecified deps
        successMsg(dependencies.length)
    } else {
        //nothing updated
        console.log("\nThere's no uninstalled dependencies 🙂")
    }
}