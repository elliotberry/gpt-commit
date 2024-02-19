#!/usr/bin/env node
import config from './config.js'
import { getGitSummary } from './git-ops.js'
import promptLoop from './prompt.js'
import { getOneMessage } from './return-message-info.js'
import yargs from 'yargs/yargs'
import { exec } from './exec.js'
import {checkTotal} from './tokens.js'
import makeOpenAIMessages from './make-openai-messages.js'


const resolvePromptTemplate = async (argv) => {
    let promptTemplateProp = 's'
    if (argv.long === true) {
        promptTemplateProp = 'l'
    }

    let promptTemplates = await config.get('promptTemplates')

    let promptTemplate = promptTemplates[promptTemplateProp]
    if (!promptTemplate) {
        throw new Error(`Invalid prompt template: ${promptTemplateProp}`)
    }
    return promptTemplate
}


const prepareRequest = async (argv) => {
    const promptTemplate = await resolvePromptTemplate(argv)

    let gitSummary = await getGitSummary(promptTemplate)
    let messages = makeOpenAIMessages(promptTemplate, gitSummary)
    let maxTokens = promptTemplate.maxTokens
    if (argv.useTogetherAI) {
        maxTokens = 32287
    }
    let [canAsk, messagesTotal] = await checkTotal(messages, maxTokens)
    return [promptTemplate, gitSummary, canAsk, messagesTotal]
}

const throwOverTokenLimitError = (messagesTotal, promptTemplate) => {
    throw new Error(
        `Message exceeds token limit. ${messagesTotal} tokens used with this commit, ${promptTemplate.maxTokens} available.`
    )
}

const main = async () => {
    try {
        const argv = yargs(process.argv.slice(2))
            .option('interactive', {
                alias: 'i',
                description: `Ask for confirmation before committing message.`,
                type: 'boolean',
                default: false,
            })
            .option('printOnly', {
                alias: 'p',
                description: `don't apply commit. intended for piping elsewhere.`,
                type: 'boolean',
                default: false,
            })
            .option('useTogetherAI', {
                alias: 't',
                description: `use Together AI instead of OpenAI.`,
                type: 'boolean',
                default: false,
            })
            .option('short', {
                alias: 's',
                description: `use short prompt template\nstandard, one-liner commit message.\nexample: "fix: typo in README.md"`,
                type: 'boolean',
                default: false,
            })
            .option('long', {
                alias: 'l',
                description:
                    'use long prompt template\nresults in a longer, more detailed commit.',
                type: 'boolean',
                default: false,
            })
            .check((argv) => {
                if (argv.noPrompt && argv.printOnly) {
                    throw new Error(
                        '--noPrompt and --printOnly are mutually exclusive, as they handle the\nunprompted behavior differently.\nIf you want to print the commit message without prompting, use --printOnly.\nIf you want to commit without prompting, use --noPrompt.'
                    )
                }
                if (argv.short === true && argv.long === true) {
                    throw new Error(
                        '--short and --long are mutually exclusive.'
                    )
                }
                return true
            })
            .usage(
                'Have chatGPT write your commits for you.\n\nUsage: $0 [options]'
            )
            .help('help')
            .alias('help', 'h')
            .parse()

        let [promptTemplate, gitSummary, canAsk, messagesTotal] = await prepareRequest(argv)
        if (!canAsk) {
            if (argv.long) {
                console.log(`Message exceeds token limit. Changing prompt length...`);
                [promptTemplate, gitSummary, canAsk, messagesTotal] = await prepareRequest({long: false, useTogetherAI: argv.useTogetherAI})
                if (!canAsk) {
                    throwOverTokenLimitError(messagesTotal, promptTemplate)
                }
            }
            else {
                throw new Error(
                    throwOverTokenLimitError(messagesTotal, promptTemplate)
                )
            }
        }
        let provider = argv.useTogetherAI ? 'together' : 'openai'
        if (!argv.interactive) {
            let [message, costStr] = await getOneMessage(
                promptTemplate,
                gitSummary,
                provider
            )
            //If we just want our message, log it and it only.
            if (argv.p) {
                console.log(message)
                process.exit(0)
            }
            //otherwise, automatically commit it.
            else {
                await exec(`cd ${process.cwd()} && git commit -m "${message}"`)
                console.log(costStr)
                console.log('Committed with the message "' + message + '".')
                process.exit(0)
            }
        } else {
            let finalMessage = await promptLoop(
                gitSummary,
                promptTemplate,
                provider
            )
            await exec(`cd ${process.cwd()} && git commit -m "${finalMessage}"`)
            console.log('Committed with the message "' + finalMessage + '".')
            process.exit(0)
        }
    } catch (error) {
        console.error(`Error: ${error.message}`)
        process.exit(1)
    }
}
main()
