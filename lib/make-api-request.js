import config from './config.js'
import makeOpenAIMessages from './make-openai-messages.js'

const getCommitMessage = async (promptTemplate, gitSummary) => {
    let apiKey = process.env['OPENAI_API_KEY'] || config.get('openAIKey')
    if (!apiKey) {
        throw new Error('OPENAI_API_KEY environment variable is not set.')
    }
    try {
        let requestBody = {
            model: config.get('model'),
            messages: makeOpenAIMessages(promptTemplate, gitSummary),
            max_tokens: promptTemplate.maxTokens,
            n: 1,
            stop: null,
            temperature: 0.7,
            stream: false
        };
        const response = await fetch(
            'https://api.openai.com/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env['OPENAI_API_KEY'] || config.get('openAIKey')}`,
                },
                body: JSON.stringify(requestBody),
            }
        )
        if (!response.ok) {
            throw new Error(
                `HTTP status: ${response.status} ${response.statusText} - this is likely an issue with the API key. You used: ${apiKey} and your body is: ${JSON.stringify(requestBody)}`
            )
        }
        const data = await response.json()
        const message = data.choices[0].message.content.trim()
        if (message === '') {
            throw new Error('Empty message received from API')
        }
        if (message.indexOf('"') !== -1) {
            message.replace(/"/g, "'")
        }

        return [message, data.usage]
    } catch (error) {
        throw new Error(`in API request: ${error.message}`)
    }
}

export default getCommitMessage
