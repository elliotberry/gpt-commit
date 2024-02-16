# gpt-commit

![](sick-logo.jpg)
_me, at work_

## What is?

CLI tool that uses GPT-4 to auto-generate succinct commit messages by reading staged changes.

Uses GPT-4 model by default, although you can edit this.

Entering the command puts you on the hook for about 1/3 cent usage, so make sure you're not going to overdraft on this one before calling me to haggle over a refund.

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


- `-i` (interactive): Shows user prompt for commit message (default: false).
- `-p` (printOnly): Prints the commit message without user interaction (default: false).
- `s` (short): Uses a shorter prompt template for less detailed commit messages (default: true).
- `-l` (long): Uses a longer prompt template for more detailed commit messages (slightly more expensive, default: false).

## Message Templates
Right now, the settings for each commit message are established in configstore - so, if you'd like to modify them, you can do so by editing configstore's json file located at `~/.config/configstore/gpt-commit.json`. The defaults, short and long, are as follows:

Short:

```json
"prompt": "Generate a succinct summary of the following code changes, with as much detail as possible, using no more than 50 characters.",
"maxTokens": 500,
"diffCommand": 'git diff --cached --stat'

```

Long:
  
```json
"prompt": 'Generate a summary of the code changes provided with as much detail as possible. Follow this format: commit should include title and body seperated by blank line. title should be imperative, start upper case, no periods. max 50 chars. body should explain what and why, word wrap at 72 chars. Shy away from describing each exact change, and lean more towards describing the whole of the changes in an understandable way, summing them up. Here is the code: \n`',,
"maxTokens": 4096,
"diffCommand": 'git diff --cached'

```
### Warranty and Liability

This program is provided as-is, and is almost certainly not good. 
