import { spawn } from 'child_process'

const exec = async (cmdStr, cwd = process.cwd()) => {
    return new Promise((resolve, reject) => {
        const cmdArray = cmdStr.split(' ')
        const command = cmdArray.shift()
        const cmd = spawn(command, cmdArray, { cwd })
        console.log(`Running command: ${command} ${cmdArray.join(' ')}`)
        let allData = ''
        let allError = ''

        cmd.stdout.on('data', (data) => {
            allData += data.toString()
        })

        cmd.stderr.on('data', (data) => {
            console.error(`Error: ${data.toString()}`)
            allError += data.toString()
        })

        cmd.on('close', (code) => {
            if (code === 0) {
                resolve(allData)
            } else {
                reject(
                    new Error(
                        `Command failed with code ${code}: ${allError}, ${allData}`
                    )
                )
            }
        })

        cmd.on('error', (error) => {
            reject(new Error(`Spawn error: ${error.message}`))
        })
    }).catch((error) => {
        if (error.message.includes('not staged')) {
            throw new Error(`no changes to commit.`)
        } else {
            throw new Error(`${error.message}`)
        }
    })
}

export default exec
