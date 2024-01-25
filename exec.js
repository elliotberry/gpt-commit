import { exec as originalExec } from 'child_process';

export const exec = async function (cmd) {
    return new Promise(function (res, rej) {
        originalExec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error(`error: ${error.message}`);
                rej(error);
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                rej(stderr);
            }

            res(stdout);
        });
    });
};
