#!/usr/bin/env node

import config from './config.js'
import { exec } from './exec.js';
import promptLoop from "./prompt.js";


const commit = async (message) => {
    try {
        let res = await exec(`git commit -m "${message}"`);
        if (res.indexOf('nothing to commit, working tree clean') > -1) {
            throw new Error('nothing to commit, working tree clean')
        }
        return res;
    } catch (error) {
        console.error(`Error while committing: ${error.message}`)
        process.exit(1)
    }
}

if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY environment variable is not set.')
    process.exit(1)
}

async function getGitSummary(debug=false) {
    if (debug) {
        return `config.json |  4 ++++
        index.js    | 53 ++++++++++++++++++++++++++++++-----------------------
        2 files changed, 34 insertions(+), 23 deletions(-)`;
    }
    try {
        const stdout = await exec(
            `cd ${process.cwd()} && ${config.get("diffCommand")}`
        )
        const summary = stdout.trim()

        if (summary.length === 0) {
            return null
        }

        return summary
    } catch (error) {
        console.error(`Error while summarizing Git changes: ${error.message}`)
        process.exit(1)
    }
}

const main = async () => {
    try {
        let noPrompt = config.get("noPrompt")
       if (process.argv.join(' ').indexOf('--no-prompt') > -1 || process.argv.join(' ').indexOf('-n') > -1) {
              noPrompt = true
        }
        const gitSummary = await getGitSummary(config.get("debug"))

        if (!gitSummary) {
            console.log('No changes to commit. Commit canceled.')
            process.exit(0)
        }

        let [confirmedVal, shouldEcho] = await promptLoop(gitSummary, noPrompt)
        if (shouldEcho) {
            console.log(confirmedVal)
            process.exit(0)
        } else {
            await commit(`git commit -m "${confirmedVal}"`)
         
            console.log('Committed with the suggested message.')
            process.exit(0)
        }
    } catch (error) {
        console.error(error)
        process.exit(1)
    }
}
main()
