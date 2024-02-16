import { encode } from 'gpt-tokenizer'

//for error-checking, is our git summary too long?

const tokenInfo = async (text) => {
    const tokens = await encode(text)
    return tokens.length
}
const checkTotal = async (messages, maxTokens) => {
let messagesTotal =
            (await tokenInfo(messages[0].content)) +
            (await tokenInfo(messages[1].content))

        if (messagesTotal > maxTokens) {
            throw new Error(
                `Message exceeds token limit. ${messagesTotal} tokens used with this commit, ${maxTokens} available.`
            )
        }
    }
    
export {checkTotal}
