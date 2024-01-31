# gpt-commit

![](sick-logo.jpg)
_me, at work_

## What is?

CLI tool that uses OpenAI API to generate succinct commit messages with as much detail as possible, using no more than 50 characters. At least, that's what I'm asking for.

Uses GPT-4 model, or whatever you want in config. Entering the command puts you on the hook for about 1/3 cent usage, so make sure you're not going to overdraft on this one before calling me to haggle over a refund.

### Getting Started

1. `yarn global add elliotberry/gpt-commit`
2. Set your OpenAI API Key: `export OPENAI_API_KEY=<YOUR_API_KEY>`. protip: put it in the ol' `.zshrc`
3. Run the program: `gptcommit` inside a repository folder of your choosing. Make sure you've got some changes staged: `git add ./delete_system32.h`.

### And then, this:

Example output:

```
§ gptcommit
Suggested commit:

"did basically nothing other than update the readme's spelling".

This cost you $350.55. Do you want to use it?
(Y)es, (p)rint, (n)ew message or (q)uit  [default=yes]
```

-   Y/yes/sí: will automatically commit the suggested message
-   q/quit: will get you THE HECK OUTTA THERE
-   n/new: will smash that http request and ask for another commit message with the same input.

## Options

- `-d` (debug): For internal debugging (default: false).
- `-n` (noPrompt): Applies the commit automatically without user prompt (default: false).
- `-p` (printOnly): Prints the commit message without user interaction (default: false).
- `-l` (long): Uses a longer prompt template for more detailed commit messages (slightly more expensive, default: false).

### Advanced Configuration
Under the hood, some basic opts are described using the `configstore` package, which on posix systems is stored in `~/.config/configstore/gpt-commit.json`. You can edit this file to change the default behavior of the program. Here's what we got:

```
{
    "prompt": "Generate a succinct summary of the following code changes, with as much detail as possible, using no more than 50 characters.\n`",
    "model": "gpt-4",
    "debug": false,
    "diffCommand": "git diff --cached --stat",
    "maxTokens": 500,
}
```
### Warranty and Liability

This program is provided as-is, and is almost certainly not good. 
