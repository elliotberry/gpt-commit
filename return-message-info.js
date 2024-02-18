import { getCommitMessage } from './make-api-request.js'
import { calculateCost } from './calculateCost.js'
import config from './config.js'


/**
 * Calculates the spend and returns it as a string to be console logged.
 * @param {number} cost - The cost to be added to the total spend.
 * @returns {string} - The total spend as a string.
 */
const doSpendCalculusAndReturnString = async (cost) => {
    let totalStr = ''
    let showTotalSpend = config.get('showTotalSpend')
    if (showTotalSpend) {
        let totalSpend = config.get('totalSpend')
        if (!totalSpend) {
            totalSpend = 0
        }
        let newTotalSpend = totalSpend + cost
        config.set('totalSpend', newTotalSpend)
        totalStr = newTotalSpend.toFixed(3)
    }
    return totalStr
}

/**
 * Replaces double quotes with single quotes in the given message.
 * 
 * @param {string} message - The message to be cleaned up.
 * @returns {Promise<string>} The cleaned up message.
 */
const cleanupMessage = async (message) => {
    if (message.indexOf('"') !== -1) {
        message = message.replace(/"/g, "'")
    }
    return message
}

const getOneMessage = async (promptTemplate, gitSummary) => {
  
    let [message, usage] = await getCommitMessage(promptTemplate, gitSummary)
    message = await cleanupMessage(message)
    let cost = await calculateCost(usage.prompt_tokens, usage.completion_tokens)
    let totalStr = await doSpendCalculusAndReturnString(cost)
    let costStr = `Cost: $${cost} ($${totalStr} lifetime)`

    return [message, costStr]
}

export { getOneMessage, cleanupMessage }