
/**
 * Generates an array of messages for OpenAI chat-based models.
 *
 * @param {Object} promptTemplate - The template for the system message.
 * @param {string} promptTemplate.prompt - The prompt for the system message.
 * @param {string} gitSummary - The summary of the git commit.
 * @returns {Array} - An array of messages for OpenAI chat-based models.
 */
const makeMessages = (promptTemplate, gitSummary) => {
  if (!promptTemplate || !promptTemplate.prompt) {
    throw new Error(`missing promptTemplate or gitSummary`);
  }
  return [
    {
      role: "system",
      content: promptTemplate.prompt,
    },
    {
      role: "user",
      content: gitSummary,
    },
  ];
};
export default makeMessages;