import fetch from 'node-fetch'
import config from './config.js'

export const getMessage = async (gitSummary, promptTemplate) => {
    let apiKey = process.env['OPENAI_API_KEY'] || config.get('openAIKey')
    if (!apiKey) {
        throw new Error('OPENAI_API_KEY environment variable is not set.')
    }
    try {
        const response = await fetch(
            'https://api.openai.com/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env['OPENAI_API_KEY'] || config.get('openAIKey')}`,
                },
                body: JSON.stringify({
                    model: config.get('model'),
                    messages: [
                        {
                            role: 'system',
                            content: promptTemplate.prompt,
                        },
                        {
                            role: 'user',
                            content: gitSummary,
                        },
                    ],
                    max_tokens: promptTemplate.maxTokens,
                    n: 1,
                    stop: null,
                    temperature: 0.7,
                    stream: false,
                }),
            }
        )
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        const message = data.choices[0].message.content.trim()
        return [message, data.usage]
    } catch (error) {
        console.error(`Error while getting api message: ${error.message}`)
        process.exit(1)
    }
}
