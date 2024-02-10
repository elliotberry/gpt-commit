import { exec } from './exec.js'



async function getGitSummary(promptTemplate) {
    try {
    
        const stdout = await exec(
            `cd ${process.cwd()} && ${promptTemplate.diffCommand}`
        )
        const summary = stdout.trim()

        if (summary.length === 0 || summary === "''" || summary === '""' || summary === ' ' || !summary) {
            throw new Error(`received empty git summary. This is likely an issue with the diff command.`)
        }

        return summary
    } catch (error) {
        throw new Error(`in getGitSummary: ${error.message}`)
    }
}

export { getGitSummary }
