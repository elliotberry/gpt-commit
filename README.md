# gpt-commit

![](sick-logo.jpg)
*me, at work*

## What is?
CLI tool that uses OpenAI API to generate succinct commit messages with as much detail as possible, using no more than 50 characters. At least, that's what I'm asking for.

Uses GPT-4 model. Entering the command puts you on the hook for about 1/3 cent usage, so make sure you're not going to overdraft on this one.

## Getting Started
1. `yarn global add elliotberry/gpt-commit`
2. Set your OpenAI API Key: `export OPENAI_API_KEY=<YOUR_API_KEY>`. protip: put it in the ol' `.zshrc`
3. Run the program: `gptcommit` inside a repository folder of your choosing.
4. ????
5. It will ask you if you'd like to commit what it came up with.

## And then...
The program will prompt for a summary of the code changes and will generate a suggested commit message based on the input.