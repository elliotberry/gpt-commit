//calculateCost for a call to OpenAI's GPT-4 API
//tokens -> $

export const calculateCost = async (promptTokens, completionTokens) => {
    let gpt4 = {
        promptCostPerToken: 0.00003,
        completionCostPerToken: 0.00006,
    }
    let total =
        promptTokens * gpt4.promptCostPerToken +
        completionTokens * gpt4.completionCostPerToken
    return total
}
