import execy from './exec.js'

/**
 * Retrieves the git summary using the provided prompt template.
 *
 * @param {Object} promptTemplate - The prompt template object.
 * @returns {Promise<string>} The git summary.
 * @throws {Error} If the git summary is empty or there is an error retrieving it.
 */

String.prototype.removeAll = function(str) {
    if (Array.isArray(str)) {
        str.forEach((s) => {
            this.removeAll(s)
        })
        return this
    }
    else if (typeof str === 'string') {
        return this.split(str).join('')
    }
    else {
        throw new Error(`removeAll received an invalid argument: ${str}`)
    }

}
const checkIfEmpty = (summary) => {
    let check = summary.trim().removeAll(["'", '"', ' ', '\n', '\t', '\r']).trim()
    if (check.length < 5) {
        return true
    }
    else {
        return false
    }
}
async function getGitSummary(promptTemplate) {
    try {
    
        const stdout = await execy(promptTemplate.diffCommand, process.cwd())
        if (checkIfEmpty(stdout)) {
            throw new Error(`received empty git summary. This is likely an issue with the diff command. received: ${stdout}`)
        }
        const summary = stdout.trim()

        return summary
    } catch (error) {
        throw new Error(`in getGitSummary: ${error}`)
    }
}

export default getGitSummary
