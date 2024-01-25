import Configstore from 'configstore'

const config = new Configstore('gpt-commit', {
    prompt: 'Generate a succinct summary of the following code changes, with as much detail as possible, using no more than 50 characters.\n`',
    model: 'gpt-4',
    debug: false,
    diffCommand: 'git diff --cached --stat',
    maxTokens: 500,
})

export default config
