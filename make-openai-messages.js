const makeMessages = (promptTemplate, gitSummary) => {
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