//calculateCost for a call to OpenAI's GPT-4 API
//tokens -> $

/**
 * Calculates the cost of generating a completion using GPT-4 based on the number of prompt tokens and completion tokens.
 * 
 * @param {number} promptTokens - The number of tokens in the prompt.
 * @param {number} completionTokens - The number of tokens in the completion.
 * @returns {number} The total cost of generating the completion.
 */
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
