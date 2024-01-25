#!/usr/bin/env node
import OpenAI from 'openai'
import prompts from 'prompts'
import fs from 'fs/promises'
import { exec as originalExec } from 'child_process'
var debug = false;
var config;
let apiKey = process.env.OPENAI_API_KEY
if (!apiKey) {
    console.error('OPENAI_API_KEY environment variable is not set.')
    process.exit(1)
}
const calculateCost = async (promptTokens, completionTokens) => {
    let gpt4 = {
        promptCostPerToken: 0.00003,
        completionCostPerToken: 0.00006,
    }
    let total =
        promptTokens * gpt4.promptCostPerToken +
        completionTokens * gpt4.completionCostPerToken
    return total
}

//maing this more async, i suppose
const exec = async function (cmd) {
    return new Promise(function (res, rej) {
        originalExec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error(`error: ${error.message}`)
                rej(error)
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`)
                rej(stderr)
            }

            res(stdout)
        })
    })
}

async function getGitSummary(debug=false) {
    if (debug) {
        return `config.json |  4 ++++
        index.js    | 53 ++++++++++++++++++++++++++++++-----------------------
        2 files changed, 34 insertions(+), 23 deletions(-)`;
    }
    try {
        const stdout = await exec(
            `cd ${process.cwd()} && git diff --cached --stat`
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

const getMessage = async (gitSummary) => {
    const openai = new OpenAI({
        apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
    })
    const response = await openai.chat.completions.create({
        model: config.model,
        messages: [
            {
                role: 'system',
                content: config.prompt,
            },
            {
                role: 'user',
                content: gitSummary,
            },
        ],
        max_tokens: 500,
        n: 1,
        stop: null,
        temperature: 0.7,
        stream: false,
    })

    const message = response.choices[0].message.content.trim()
    return [message, response.usage]
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
        if (process.argv.length > 2) {
            if (process.argv[2] === '--debug') {
                debug = true
            }
        }
        const configData = await fs.readFile('./config.json')
        config = JSON.parse(configData)
        const gitSummary = await getGitSummary(debug)

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
