#!/usr/bin/env node
import chalk from 'chalk'
import ora from 'ora'
import initialInstall from './init'
import unspecifiedDeps from './unspecified-deps'
import noUnspecifiedDeps from './no-unspecified-deps'
import checkUnSpecDeps from './check-unspecified-deps'
import getPkgCounts from './get-pkg-counts'

let dir = process.argv[1] || process.cwd()
let modsBeforeInstall, modsAfterInstall

;(async () => {
    console.log(`\n📦  ni, ${chalk.bold('A better npm install')} \n`)
    const depSpinner = ora('Installing Dependencies').start()
    
    modsBeforeInstall = await getPkgCounts(dir)

    if(!modsBeforeInstall.length) {
        modsAfterInstall = await initialInstall(dir, depSpinner)
    }

    let res = await checkUnSpecDeps(dir)

    if(res.unspecifiedDeps.length) unspecifiedDeps(res.deps, res.unspecifiedDeps, dir)
    else noUnspecifiedDeps(res.deps, modsBeforeInstall, modsAfterInstall)
})()