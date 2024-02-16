import prompts from 'prompts'
import { getOneMessage } from './return-message-info.js'

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


const ask = async (message, costStr) => {
    const confirm = await prompts({
        type: 'text',
        name: 'value',
        validate: (value) => validate(value),
        message: `Suggested message:\n\n"${message}"\n\n${costStr} Use it?\n(Y)es, (n)ew message or (q)uit  [default=yes; (apply and commit)]`,
    })
    return confirm.value
}

//yes, it's true, i don't understand Switch/case
const ifOption = (input, option) => {
    return promptions[option].includes(input.toLowerCase())
}



//return array of message and boolean of whether to echo the message
/**
 * Executes a loop for prompting the user with a message and receiving input.
 * @param {string} gitSummary - The summary of the git changes.
 * @param {string} promptTemplate - The template for the prompt message.
 * @returns {Promise<string>} The user's input message.
 * @throws {Error} If an error occurs during the prompt loop.
 */
const promptLoop = async (gitSummary, promptTemplate) => {
    try {
        let [message, costStr] = await getOneMessage(promptTemplate, gitSummary)

        let input = await ask(message, costStr)
        if (ifOption(input, 'quit')) {
            process.exit(0)
        } else if (ifOption(input, 'new')) {
            return await promptLoop(
                gitSummary,
                promptTemplate
            )
        } else {
            return message
        }
    } catch (error) {
        throw new Error(`in prompt loop: ${error.message}`)
    }
}

export default promptLoop
