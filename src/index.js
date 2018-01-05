#!/usr/bin/env node
import 'babel-polyfill'

import { exec } from 'child-process-promise'
import pjson from '../package.json'
import npm from '../lib/npm'
import fs from 'fs-extra'
import chalk from 'chalk'
import ora from 'ora'
import { unescape } from 'querystring';

const depCheck = (str,obj) => (!str.startsWith('./') && !obj.hasOwnProperty(str))
const checkExtension = file => file.includes('.js') ? file : `${file}.js`
const colored = (color, msg) => console.log(chalk[color](msg))
const successMsg = pkgs => console.log(`\nInstalled ${pkgs} packages successfully 🎉`)

let dependencies = []
let unspecifiedDeps = []
let argv = process.argv
let modsBeforeInstall,
    modsAfterInstall

;(async () => {
    console.log(`\n 📦  ni, ${chalk.bold('A better npm install')} \n`)
    const depSpinner = ora('Installing Dependencies').start()

    let directory = process.argv[3] || process.cwd()
    let targetFile = checkExtension(argv[2])
    let actualPath = `${directory}/${targetFile}`
    let texts = await fs.readFile(actualPath, 'utf8')
    let codeArray = texts.split('\n')
    let re = /require\('(.*)'\)/

    let packagePath = `${directory}/package.json`
    let specifiedDeps = await fs.readJSON(packagePath)

    modsBeforeInstall = await checkMods(directory)

    if(!modsBeforeInstall.length) {
        let depsArray = Object.keys(specifiedDeps.dependencies)

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
    
    if(unspecifiedDeps.length) {
        let unDepInstallSpinner = ora('Installing Unspecified Dependencies').start()
        try {
            let npmOpt = {
                cwd: directory,
                save: true
            }
            
            await npm.install(unspecifiedDeps, npmOpt)
            unDepInstallSpinner.succeed()

            colored('Installed Unspecified List:', 'magenta')
            for(let dep of unspecifiedDeps) {
                console.log(`${chalk.gray(dep)}@${getLatest(dep)} ${chalk.green('✔︎')}`)
            }

            successMsg(dependencies.length + unspecifiedDeps.length)
        } catch (e) {
            console.error(`${chalk.redBright('Failed:')} ${e}`)
        }
    } else {
        if(modsBeforeInstall < modsAfterInstall) {
            successMsg(dependencies.length)
        } else {
            console.log("\nThere's no uninstalled dependencies 🙂")
        }
    }
    
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
})()