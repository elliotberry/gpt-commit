#!/usr/bin/env node

import config from './config.js'
import { getGitSummary, commit } from './git-ops.js'
import promptLoop from './prompt.js'
import { hideBin } from 'yargs/helpers'
import yargs from 'yargs'


const main = async () => {
    try {
        let noPrompt = config.get('noPrompt')
        const argv = yargs(hideBin(process.argv))
            .option('noPrompt', {
                alias: 'n',
                description: `don't prompt user, apply commit automatically and exit`,
                type: 'boolean',
                default: false,
            })
            .option('printOnly', {
                alias: 'p',
                description:
                    `intended for piping elsewhere.\ndon't prompt user, and do not automatically apply commit, or print other info - just print the commit message`,
                type: 'boolean',
                default: false,
            })
            .option('short', {
                alias: 's',
                description:
                    `use short prompt template\nstandard, one-liner commit message.\nexample: "fix: typo in README.md"`,
                type: 'boolean',
                default: true,
            })
            .option('cost', {
                alias: 'c',
                description: 'show cost of commit, as well as total spend.',
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
            .conflicts('noPrompt', 'printOnly')
            .conflicts('short', 'long')
            .conflicts('cost', 'noPrompt')
            .usage("Have chatGPT write your commits for you.")
            .argv

        let promptTemplateProp = 's'
        if (argv.long === true) {
            promptTemplateProp = 'l'
        }
        if (argv.short === true) {
            promptTemplateProp = 's'
        }

        let promptTemplates = await config.get('promptTemplates')

        let promptTemplate = promptTemplates[promptTemplateProp]
        if (!promptTemplate) {
            throw new Error(`Invalid prompt template: ${promptTemplateProp}`)
        }
        noPrompt = argv.noPrompt


        const gitSummary = await getGitSummary(
            promptTemplate
        )

        if (!gitSummary) {
            console.error('No changes to commit. Commit canceled.')
            process.exit(0)
        }

        let [confirmedVal, shouldEcho] = await promptLoop(
            gitSummary,
            noPrompt,
            promptTemplate,
            argv.printOnly
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
        console.error(error)
        process.exit(1)
    }
}
main()
