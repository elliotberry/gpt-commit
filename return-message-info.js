import { getMessage } from './getMessage.js'
import { calculateCost } from './calculateCost.js'
import config from './config.js'


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

const cleanupMessage = async (message) => {
    if (message.indexOf('"') !== -1) {
        message = message.replace(/"/g, "'")
    }
    return message
}

const getOneMessage = async (promptTemplate, gitSummary) => {
  
    let [message, usage] = await getMessage(gitSummary, promptTemplate)
    message = await cleanupMessage(message)
    let cost = await calculateCost(usage.prompt_tokens, usage.completion_tokens)
    let totalStr = await doSpendCalculusAndReturnString(cost)
    let costStr = `Cost: $${cost} ($${totalStr} lifetime)`

    return [message, costStr]
}

export { getOneMessage, cleanupMessage }