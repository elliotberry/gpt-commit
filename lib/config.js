import Configstore from 'configstore'

//git diff --stat HEAD^ HEAD | awk '{print $1}' | xargs -I {} git diff HEAD^ HEAD -- {} | grep -E '^\+|^\-|@@' | sed 's/^+/\[Added\] /;s/^-/\[Removed\] /;s/^@@/\[Context\] /'

const config = new Configstore('gpt-commit', {
    promptTemplates: {
        s: {
            maxTokens: 500,
            diffCommand: 'git diff --cached --compact-summary',
            prompt: 'Generate a succinct summary of the following code changes, with as much detail as possible, using no more than 50 characters.\n`',
        },
        l: {
            maxTokens: 4096,
            diffCommand: 'git diff --cached',
            prompt: 'Generate a summary of the code changes provided with as much detail as possible. Follow this format: commit should include title and body seperated by blank line. title should be imperative, start upper case, no periods. max 50 chars. body should explain what and why, word wrap at 72 chars. Shy away from describing each exact change, and lean more towards describing the whole of the changes in an understandable way, summing them up. Here is the code: \n`',
        },
    },
    model: 'gpt-4',
    showTotalSpend: true,
    totalSpend: 0,
})

export default config
