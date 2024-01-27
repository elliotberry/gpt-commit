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
    print: ['p', 'print', 'echo', 'e', '🖨️'],
    quit: ['q', 'quit', 'exit', 'no', 'non', 'nein', 'nah'],
}
const validate = (value) => {
    let allPrompts = Object.values(promptions).reduce(
        (acc, curr) => acc.concat(curr),
        []
    )
    console.log(allPrompts.join(', '))
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
const ask = async (message, cost) => {
    let totalStr = await doSpendCalculusAndReturnString(cost)
    const confirm = await prompts({
        type: 'text',
        name: 'value',
        validate: (value) => validate(value),
        message: `Suggested message:\n\n"${message}"\n\nThis cost you $${cost}${totalStr}. Do you want to use it?\n(Y)es, (p)rint, (n)ew message or (q)uit  [default=yes; apply and commit]`,
    })
    return confirm.value
}

//yes, it's true, i don't understand Switch/case
const ifOption = (input, option) => {
    return promptions[option].includes(input.toLowerCase())
}

const promptLoop = async (gitSummary, noPrompt = false) => {
    let [message, usage] = await getMessage(gitSummary)
    let cost = await calculateCost(usage.prompt_tokens, usage.completion_tokens)
    if (noPrompt) {
        let totalStr = await doSpendCalculusAndReturnString(cost)
        totalStr = " " + totalStr
        console.log(`This commit cost $${cost}.${totalStr}`)
        return [message, false]
    } else {
        let input = await ask(message, cost)
        if (ifOption(input, 'quit')) {
            console.log('Commit canceled.')
            process.exit(0)
        } else if (ifOption(input, 'retry')) {
            return await promptLoop(gitSummary, false)
        } else if (ifOption(input, 'print')) {
            return [message, true]
        } else {
            return [message, false]
        }
    }
}

export default promptLoop
