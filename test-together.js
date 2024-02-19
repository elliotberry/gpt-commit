import getCommitMessage from './together.js'
const template = {
            maxTokens: 4096,
            diffCommand: 'git diff --cached',
            prompt: 'Generate a summary of the code changes provided with as much detail as possible. Follow this format: commit should include title and body seperated by blank line. title should be imperative, start upper case, no periods. max 50 chars. body should explain what and why, word wrap at 72 chars. Shy away from describing each exact change, and lean more towards describing the whole of the changes in an understandable way, summing them up. Here is the code: \n\`',
        };

let gitSummary = `diff --git a/exec.js b/exec.js
index 4362382..acaa0a1 100644
--- a/exec.js
+++ b/exec.js
@@ -1,23 +1,5 @@
 import { exec as originalExec, spawn } from 'child_process'
 
-export const exec = async function (cmd) {
-    return new Promise(function (res, rej) {
-        originalExec(
-            cmd,
-            { maxBuffer: 1024 * 500 },
-            (error, stdout, stderr) => {
-                if (error) {
-                    rej(\`error in exec: \${error.message}\`)
-                }
-                if (stderr) {
-                    rej(\`stderr in exec: \${stderr}\`)
-                }
-
-                res(stdout)
-            }
-        )
-    })
-}
 
 export const execy = async function (cmdStr, cwd) {
     return new Promise(function (res, rej) {
diff --git a/index.js b/index.js
index c5b2b25..edf8ee2 100644
--- a/index.js
+++ b/index.js
@@ -1,5 +1,4 @@
 #!/usr/bin/env node
-
 import config from './config.js'
 import { getGitSummary } from './git-ops.js'
 import promptLoop from './prompt.js'
@@ -31,7 +30,11 @@ const prepareRequest = async (argv) => {
 
     let gitSummary = await getGitSummary(promptTemplate)
     let messages = makeOpenAIMessages(promptTemplate, gitSummary)
-    let [canAsk, messagesTotal] = await checkTotal(messages, promptTemplate.maxTokens)
+    let maxTokens = promptTemplate.maxTokens
+    if (argv.useTogetherAI) {
+        maxTokens = 32287
+    }
+    let [canAsk, messagesTotal] = await checkTotal(messages, maxTokens)
     return [promptTemplate, gitSummary, canAsk, messagesTotal]
 }
 
@@ -56,6 +59,12 @@ const main = async () => {
                 type: 'boolean',
                 default: false,
             })
+            .option('useTogetherAI', {
+                alias: 't',
+                description: \`use Together AI instead of OpenAI.\`,
+                type: 'boolean',
+                default: false,
+            })
             .option('short', {
                 alias: 's',
                 description: \`use short prompt template\nstandard, one-liner commit message.\nexample: "fix: typo in README.md"\`,
@@ -88,6 +97,7 @@ const main = async () => {
             .help('help')
             .alias('help', 'h')
             .parse()
+
         let [promptTemplate, gitSummary, canAsk, messagesTotal] = await prepareRequest(argv)
         if (!canAsk) {
             if (argv.long) {
diff --git a/test-together.js b/test-together.js
new file mode 100644
index 0000000..c85f2f1
--- /dev/null
+++ b/test-together.js
@@ -0,0 +1,5 @@
+const template ={
+            maxTokens: 4096,
+            diffCommand: 'git diff --cached',
+            prompt: 'Generate a summary of the code changes provided with as much detail as possible. Follow this format: commit should include title and body seperated by blank line. title should be imperative, start upper case, no periods. max 50 chars. body should explain what and why, word wrap at 72 chars. Shy away from describing each exact change, and lean more towards describing the whole of the changes in an understandable way, summing them up. Here is the code: \n\`',
+        }
 No newline at end of file
diff --git a/together.js b/together.js
new file mode 100644
index 0000000..23a621f
--- /dev/null
+++ b/together.js
@@ -0,0 +1,33 @@
+import config from './config.js'
+import makeOpenAIMessages from './make-openai-messages.js'
+
+const getCommitMessage = async (promptTemplate, gitSummary) => {
+    const response = await fetch(
+        'https://api.together.xyz/v1/chat/completions',
+        {
+            method: 'POST',
+            headers: {
+                'Content-Type': 'application/json',
+                Authorization: \`Bearer ${process.env.TOGETHER_API_KEY}\`,
+            },
+            body: JSON.stringify({
+                model: 'Qwen/Qwen1.5-14B-Chat',
+                max_tokens: 32287,
+                temperature: 0.7,
+                top_p: 0.7,
+                top_k: 50,
+                repetition_penalty: 1,
+                stream_tokens: true,
+                stop: ['<|im_end|>', '<|im_start|>'],
+                messages: makeOpenAIMessages(promptTemplate, gitSummary),
+            }),
+        }
+    )
+    if (!response.ok || response.status !== 200) {
+        throw new Error(\`Network response was not ok (\${response.status})\`)
+    }
+    let resp = await response.json()
+    return [resp.choices[0].message.content, resp.choices[0].finish_reason]
+}
+
+export default getCommitMessage
diff --git a/tokens.js b/tokens.js
index 54819fb..25bdf69 100644
--- a/tokens.js
+++ b/tokens.js
@@ -13,7 +13,7 @@ const tokenInfo = async (text) => {
  * @param {number} maxTokens - The maximum number of tokens allowed.
  * @throws {Error} If the total number of tokens exceeds the maximum token limit.
  */
-const checkTotal = async (messages, maxTokens) => {
+const checkTotal = async (messages, maxTokens, ) => {
     let result = true;
     let messagesTotal =
         (await tokenInfo(messages[0].content)) +
`;

async function main() {
    let res = await getCommitMessage(template, gitSummary)
  console.log(res)
}

main()