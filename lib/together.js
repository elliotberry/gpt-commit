import config from './config.js'
import makeOpenAIMessages from './make-openai-messages.js'

const getCommitMessage = async (promptTemplate, gitSummary) => {
    const response = await fetch(
        'https://api.together.xyz/v1/chat/completions',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'Qwen/Qwen1.5-14B-Chat',
                max_tokens: 30000,
                temperature: 0.7,
                top_p: 0.7,
                top_k: 50,
                repetition_penalty: 1,
                stream_tokens: false,
                stop: ['<|im_end|>', '<|im_start|>'],
                messages: makeOpenAIMessages(promptTemplate, gitSummary),
            }),
        }
    )
 
    if (!response.ok || response.status !== 200) {
        throw new Error(`Network response was not ok (${response.status}, ${response.statusText})`)
    }
    let resp = await response.json()
    return [resp.choices[0].message.content, resp.choices[0].finish_reason]
}

export default getCommitMessage
