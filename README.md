## gpt-commit-message

![](sick-logo.jpg)
*yes, this, too, was a dumb ai image*

# Commit Message Generator: for when I'm productively lazy
A command line tool that uses the OpenAI API to generate succinct commit messages with as much detail as possible, using no more than 50 characters.

## Getting Started
1. `yarn global add elliotberry/gpt-commit-message`
2. Set your OpenAI API Key: `export OPENAI_API_KEY=<YOUR_API_KEY>`. protip: put it in the ol' `.zshrc`
3. Run the program: `gptcommit` inside a repository folder of your choosing.
4. ????
5. It will ask you if you'd like to commit what it came up with.

## Usage
The program will prompt for a summary of the code changes and will generate a suggested commit message based on the input. You can then choose to use the generated message or cancel the commit.
