import prompts from 'prompts'
import { getMessage } from './getMessage.js'
import { calculateCost } from './calculateCost.js'
import config from './config.js'

//hell yeah, yes in random languages
const promptions = {
    yes: [
        'y',
        'yes',
        'sí',
        'si',
        'oui',
        'ja',
        'da',
        'si',
        'はい',
        'correcto',
        'correct',
        '✅',
    ],
    new: ['n', 'new', 'again', 'retry', '🔄'],
    quit: ['q', 'quit', 'exit', 'no', 'non', 'nein', 'nah'],
}

const validate = (value) => {
    let allPrompts = Object.values(promptions).reduce(
        (acc, curr) => acc.concat(curr),
        []
    )
    if (allPrompts.includes(value.toLowerCase())) {
        return true
    } else {
        return 'Please enter a valid option.'
    }
}

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
        totalStr = `($${newTotalSpend} lifetime)`
    }
    return totalStr
}

const ask = async (message, costStr) => {
    const confirm = await prompts({
        type: 'text',
        name: 'value',
        validate: (value) => validate(value),
        message: `Suggested message:\n\n"${message}"\n\n${costStr} Do you want to use it?\n(Y)es, (n)ew message or (q)uit  [default=yes; (apply and commit)]`,
    })
    return confirm.value
}

//yes, it's true, i don't understand Switch/case
const ifOption = (input, option) => {
    return promptions[option].includes(input.toLowerCase())
}
const cleanupMessage = async (message) => {
    if (message.indexOf('"') !== -1) {
        message = message.replace(/"/g, "'")
    }
    return message
}
//return array of message and boolean of whether to echo the message
const promptLoop = async (
    gitSummary,
    noPrompt,
    promptTemplate,
    printOnly,
    showCost
) => {
    try {
        let [message, usage] = await getMessage(gitSummary, promptTemplate)
        message = await cleanupMessage(message)
        let cost = await calculateCost(
            usage.prompt_tokens,
            usage.completion_tokens
        )
        let totalStr = await doSpendCalculusAndReturnString(cost)
        let costStr = `This commit cost $${cost} (${totalStr} lifetime)`
        if (noPrompt && showCost) {
            console.log(costStr)
        }
        if (noPrompt || printOnly) {
            return [message, false]
        } else {
            if (showCost === false) {
                costStr = ''
            }
            let input = await ask(message, costStr)
            if (ifOption(input, 'quit')) {
                process.exit(0)
            } else if (ifOption(input, 'new')) {
                return await promptLoop(gitSummary,
                    noPrompt,
                    promptTemplate,
                    printOnly,
                    showCost)
            } else {
                return [message, false]
            }
        }
    } catch (error) {
        throw new Error(`in prompt loop: ${error.message}`)
    }
}

export default promptLoop
