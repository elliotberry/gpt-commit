#!/usr/bin/env node
import prompts from 'prompts'
import config from './config.js'
import { calculateCost } from './calculateCost.js';
import { exec } from './exec.js';
import { getMessage } from './getMessage.js';




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

const ask = async (message, cost) => {
    const confirm = await prompts({
        type: 'text',
        name: 'value',
        message: `Suggested commit:\n\n"${message}".\n\nThis cost you $${cost}. Do you want to use it? (Y/p/n/r/q) <yes (apply automatically)/print (echo to tty)/no/retry/quit>`,
    })
    return confirm.value
}

const promptLoop = async (gitSummary) => {
    let [message, usage] = await getMessage(gitSummary)
    let cost = await calculateCost(usage.prompt_tokens, usage.completion_tokens)
    let input = await ask(message, cost)
    if (input === 'n' || input === 'q' || input === 'no' || input === 'quit') {
        console.log('Commit canceled.')
        process.exit(0)
    } else if (input === 'r' || input === 'retry') {
        return await promptLoop(gitSummary)
    } else if (input === 'p' || input === 'print') {
        return [message, true]
    } else {
        return [message, false]
    }
}

const main = async () => {
    try {
        const gitSummary = await getGitSummary(config.get("debug"))

        if (!gitSummary) {
            console.log('No changes to commit. Commit canceled.')
            process.exit(0)
        }

        let [confirmedVal, shouldEcho] = await promptLoop(gitSummary)
        if (shouldEcho) {
            console.log(confirmedVal)
            process.exit(0)
        } else {
            let res = await exec(`git commit -m "${confirmedVal}"`)
            console.log(res)
            console.log('Committed with the suggested message.')
            process.exit(0)
        }
    } catch (error) {
        console.error(error)
        process.exit(1)
    }
}
main()
