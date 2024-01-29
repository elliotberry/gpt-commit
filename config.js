import Configstore from 'configstore'

const config = new Configstore('gpt-commit', {
    prompt: 'Generate a summary of the code changes provided with as much detail as possible. Follow this format: commit should include title and body seperated by blank line. title should be imperative, start upper case, no periods. max 50 chars. body should explain what and why, word wrap at 72 chars. Here is the code: \n`',
    model: 'gpt-4',
    debug: false,
    diffCommand: 'git diff --cached',
    maxTokens: 4096,
    noPrompt: false,
    showTotalSpend: true,
    totalSpend: 0
})

export default config
