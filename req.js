import fs from 'fs'
import { Configuration, OpenAIApi } from 'openai'
import prompts from 'prompts'


import { estimate, Operation, CompletionModel } from 'openai-gpt-cost-estimator'

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)
const prompt = `Convert the following code to node.js:\n\n`

const doRequest = async (snippet) => {
    let finalPrompt = prompt + snippet
    const config = {
        operation: Operation.COMPLETION,
        model: CompletionModel.DAVINCI,
        finalPrompt,
        n: 3,
        bestOf: 5,
        maxTokens: 4096,
    }
    const result = estimate(config)

    const confirm1 = await prompts({
        type: 'confirm',
        name: 'value',
        message: `Estimated cost: "${result.totalCostDisplay}" (${result.completionTokens} tokens). Do you want to continue?`,
        initial: false,
    })
    if (!confirm1.value) {
        console.log('Commit canceled.')
        process.exit(0)
    }

    const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo-16k-0613',
        // prompt: prompt,
        messages: [
            {
                role: 'user',
                content: `please write a git commit, given this git diff: \n\n${finalPrompt}`,
            },
        ],
        max_tokens: 4096,
        n: 1,
        stop: null,
        temperature: 0.9,
    })

    const message = response.data.choices[0].message.content.trim()
    return message
}


export default doRequest