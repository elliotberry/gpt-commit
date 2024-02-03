import { exec } from './exec.js'

const commit = async (message) => {
    try {
        let res = await exec(message)
        if (res.indexOf('nothing to commit, working tree clean') > -1) {
            throw new Error('nothing to commit, working tree clean')
        }
        return res
    } catch (error) {
        throw new Error(`in commit command - ${error.message}`)
    }
}

async function getGitSummary(promptTemplate) {
    try {
        const stdout = await exec(
            `cd ${process.cwd()} && ${promptTemplate.diffCommand}`
        )
        const summary = stdout.trim()

        if (summary.length === 0) {
            return null
        }

        return summary
    } catch (error) {
        throw new Error(`in getGitSummary: ${error.message}`)
    }
}

export { getGitSummary, commit }
