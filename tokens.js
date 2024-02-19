import { encode } from 'gpt-tokenizer'



const tokenInfo = async (text) => {
    const tokens = await encode(text)
    return tokens.length
}
/**
 * Checks the total number of tokens used in the given messages and throws an error if it exceeds the maximum token limit.
 *
 * @param {Array<Object>} messages - The array of messages.
 * @param {number} maxTokens - The maximum number of tokens allowed.
 * @throws {Error} If the total number of tokens exceeds the maximum token limit.
 */
const checkTotal = async (messages, maxTokens, ) => {
    let result = true;
    let messagesTotal =
        (await tokenInfo(messages[0].content)) +
        (await tokenInfo(messages[1].content))

    if (messagesTotal > maxTokens) {
      //  throw new Error(
      //      `Message exceeds token limit. ${messagesTotal} tokens used with this commit, ${maxTokens} available.`
      //  )
      result = false;
    }
    return [result, messagesTotal];
}

export { checkTotal }
