#!/usr/bin/env node

import config from './config.js'
import {getGitSummary, commit} from './git-ops.js'
import promptLoop from './prompt.js'
import { hideBin } from 'yargs/helpers'
import yargs from 'yargs'


if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY environment variable is not set.')
    process.exit(1)
}

const main = async () => {
    try {
        let noPrompt = config.get('noPrompt')
        const argv = yargs(hideBin(process.argv))
            .option('debug', {
                alias: 'd',
                description: 'internal debugging',
                type: 'boolean',
                default: false,
            })
            .option('noPrompt', {
                alias: 'n',
                description: `don't prompt user, apply commit automatically and exit`,
                type: 'boolean',
                default: false,
            })
            .option('printOnly', {
                alias: 'p',
                description: 'do not prompt user, and do not automatically apply commit - just print the commit message',
                type: 'boolean',
                default: false
            })
            .option('long', {
                alias: 'l',
                description: 'use long prompt template - results in a longer, more detailed commit message, and is more expensive',
                type: 'boolean',
                default: false,
            })
            .argv
            let promptTemplate = 's'
        if (argv.long) {
            argv.promptTemplate = 'l'
        }

        const gitSummary = await getGitSummary(argv.debug, argv.noPrompt, promptTemplate)

        if (!gitSummary) {
            console.error('No changes to commit. Commit canceled.')
            process.exit(0)
        }

        let [confirmedVal, shouldEcho] = await promptLoop(gitSummary, noPrompt, promptTemplate, argv.printOnly)
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
