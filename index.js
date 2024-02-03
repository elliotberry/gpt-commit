#!/usr/bin/env node

import config from './config.js'
import { getGitSummary, commit } from './git-ops.js'
import promptLoop from './prompt.js'
import yargs from 'yargs/yargs'


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
    return promptTemplate;
}

const main = async () => {
    try {
        const argv = yargs(process.argv.slice(2))
            .option('noPrompt', {
                alias: 'n',
                description: `don't prompt user, apply commit automatically.`,
                type: 'boolean',
                default: false,
            })
            .option('printOnly', {
                alias: 'p',
                description: `don't prompt user, don't apply commit. intended for piping elsewhere.`,
                type: 'boolean',
                default: false,
            })
            .option('short', {
                alias: 's',
                description: `use short prompt template\nstandard, one-liner commit message.\nexample: "fix: typo in README.md"`,
                type: 'boolean',
                default: false,
            })
            .option('cost', {
                alias: 'c',
                description: 'show cost of commit, as well as total spend.',
                type: 'boolean',
                default: false
            })
            .option('long', {
                alias: 'l',
                description:
                    'use long prompt template\nresults in a longer, more detailed commit.',
                type: 'boolean',
                default: false
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
                if (argv.cost && argv.noPrompt) {
                    throw new Error(
                        '--cost and --noPrompt are mutually exclusive, since showing the cost requires printing more information.'
                    )
                }
                return true
            })
            .usage('Have chatGPT write your commits for you.\n\nUsage: $0 [options]')
            .help('help').alias('help', 'h')
            .parse()


        const promptTemplate = await resolvePromptTemplate(argv)

        const gitSummary = await getGitSummary(promptTemplate)


        let [confirmedVal, shouldEcho] = await promptLoop(
            gitSummary,
            argv.noPrompt,
            promptTemplate,
            argv.printOnly,
            argv.cost
        )
        if (shouldEcho) {
            console.log(confirmedVal)
            process.exit(0)
        } else {
            await commit(
                `cd ${process.cwd()} && git commit -m "${confirmedVal}"`
            )
            console.log('Committed with the message "' + confirmedVal + '".')
            process.exit(0)
        }
    } catch (error) {
        console.error(`Error: ${error.message}`)
        process.exit(1)
    }
}
main()
