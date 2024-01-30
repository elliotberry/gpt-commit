import { exec } from './exec.js'
import config from './config.js'

const commit = async (message) => {
    try {
        let res = await exec(message)
        if (res.indexOf('nothing to commit, working tree clean') > -1) {
            throw new Error('nothing to commit, working tree clean')
        }
        return res
    } catch (error) {
        console.error(`Error while committing: ${error.message}`)
        process.exit(1)
    }
}

async function getGitSummary(debug = false, promptTemplate = 's') {
    let promptTemplates = config.get('promptTemplates')
    if (debug) {
        return `config.json |  4 ++++
        index.js    | 53 ++++++++++++++++++++++++++++++-----------------------
        2 files changed, 34 insertions(+), 23 deletions(-)`
    }
    try {
        const stdout = await exec(
            `cd ${process.cwd()} && ${promptTemplates[promptTemplate]['diffCommand']}`
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

export { getGitSummary, commit }
