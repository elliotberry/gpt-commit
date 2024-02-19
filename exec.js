import { exec as originalExec, spawn } from 'child_process'

export const exec = async function (cmd) {
    return new Promise(function (res, rej) {
        originalExec(
            cmd,
            { maxBuffer: 1024 * 500 },
            (error, stdout, stderr) => {
                if (error) {
                    rej(`error in exec: ${error.message}`)
                }
                if (stderr) {
                    rej(`stderr in exec: ${stderr}`)
                }

                res(stdout)
            }
        )
    })
}

export const execy = async function (cmdStr, cwd) {
    return new Promise(function (res, rej) {
        let cmdArray = cmdStr.split(' ')
        const args = cmdArray.shift()
        const cmd = spawn(args, cmdArray, { cwd: cwd })
        let allData = ''
        let allError = ''
        cmd.stdout.on('data', (data) => {
         
            allData += data
        })

        cmd.stderr.on('data', (data) => {
            allError += data
        })

        cmd.on('close', (code) => {
            if (code === 0) {
                res(allData)
            } else {
                rej(allError)
            }
        })
    })
}
