import { spawn } from 'node:child_process';

const exec = async (cmdStr, cwd = process.cwd()) => {
    return new Promise((resolve, reject) => {
        // Use a regex to match either non-whitespace characters or characters within quotes
        const cmdArray = [...cmdStr.matchAll(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g)].map(arg => {
            // Remove surrounding quotes from arguments
            return arg[0].replace(/^['"]|['"]$/g, '');
        });
        
        const command = cmdArray.shift();
        console.log(command);
        const cmd = spawn(command, cmdArray, { cwd });
      //  console.debug(`Running command: ${command} ${cmdArray.join(' ')}`);
        let allData = '';
        let allError = '';

        cmd.stdout.on('data', (data) => {
            allData += data.toString();
        });

        cmd.stderr.on('data', (data) => {
           
            allError += data.toString();
        });

        cmd.on('close', (code) => {
            if (code === 0) {
                resolve(allData);
            } else {
                reject(new Error(`Command failed with code ${code}: ${allError}, ${allData}`));
            }
        });

        cmd.on('error', (error) => {
            reject(new Error(`Spawn error: ${error.message}`));
        });
    })
};

export default exec;
