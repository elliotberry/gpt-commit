import OpenAI from 'openai';
import config  from './config.js';

export const getMessage = async (gitSummary) => {
    const openai = new OpenAI({
        apiKey: process.env['OPENAI_API_KEY'] || config.get("openAIKey"), // This is the default and can be omitted
    });
    const response = await openai.chat.completions.create({
        model: config.get("model"),
        messages: [
            {
                role: 'system',
                content: config.get("prompt"),
            },
            {
                role: 'user',
                content: gitSummary,
            },
        ],
        max_tokens: config.get("maxTokens"),
        n: 1,
        stop: null,
        temperature: 0.7,
        stream: false,
    });

    const message = response.choices[0].message.content.trim();
    return [message, response.usage];
};
