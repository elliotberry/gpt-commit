import { encode, decode, isWithinTokenLimit } from 'gpt-tokenizer'

const tokenInfo = async (text) => {
    const tokenLimit = 10

    // Encode text into tokens
    const tokens = await encode(text)
    return tokens.length
}

export default tokenInfo
