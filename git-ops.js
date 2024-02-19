import { execy } from './exec.js'

/**
 * Retrieves the git summary using the provided prompt template.
 *
 * @param {Object} promptTemplate - The prompt template object.
 * @returns {Promise<string>} The git summary.
 * @throws {Error} If the git summary is empty or there is an error retrieving it.
 */
async function getGitSummary(promptTemplate) {
    try {
    
        const stdout = await execy(promptTemplate.diffCommand, process.cwd())
        
        const summary = stdout.trim()

        if (summary.length === 0 || summary === "''" || summary === '""' || summary === ' ' || !summary) {
            throw new Error(`received empty git summary. This is likely an issue with the diff command.`)
        }

        return summary
    } catch (error) {
        throw new Error(`in getGitSummary: ${error}`)
    }
}

export { getGitSummary }
