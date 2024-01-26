
import prompts from 'prompts'
import { getMessage } from './getMessage.js';
import { calculateCost } from './calculateCost.js';


const ask = async (message, cost) => {
    const confirm = await prompts({
        type: 'text',
        name: 'value',
        message: `Suggested message:

       "${message}"

       This cost you $${cost}. Do you want to use it? 
       (Y)es, (p)rint, (n)ew message or (q)uit  [default=yes; apply and commit]`,
    })
    return confirm.value
}

//hell yeah, yes in random languages
const promptions = {
    yes: ['y', 'yes', 'sí', 'si', 'oui', 'ja', 'da', 'si', 'はい', 'correcto', 'correct', '✅'],
  
    print: ['p', 'print', 'echo', 'e', '🖨️'],
    retry: ['r', 'retry', 'again', '🔄', 'n', 'new'],
    quit: ['q', 'quit', 'exit', '🚪', 'n', 'no', 'non', 'nein', 'nah', 'いいえ', 'mal', '❌'],
}
//yes, it's true, i don't understand Switch/case
const ifOption = (input, option) => {
    return promptions[option].includes(input.toLowerCase())
}

const promptLoop = async (gitSummary) => {
    let [message, usage] = await getMessage(gitSummary)
    let cost = await calculateCost(usage.prompt_tokens, usage.completion_tokens)
    let input = await ask(message, cost)
    if (ifOption(input, "quit")) {
        console.log('Commit canceled.')
        process.exit(0)
    } else if (ifOption(input, "retry")) {
        return await promptLoop(gitSummary)
    } else if (ifOption(input, "print")) {
        return [message, true]
    } else {
        return [message, false]
    }
}
export default promptLoop