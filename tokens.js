import { encode } from 'gpt-tokenizer'

const tokenInfo = async (text) => {
    const tokens = await encode(text)
    return tokens.length
}

export default tokenInfo
