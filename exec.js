import { exec as originalExec } from 'child_process';

export const exec = async function (cmd) {
    return new Promise(function (res, rej) {
        originalExec(cmd, (error, stdout, stderr) => {
            if (error) {
                rej(`error in exec: ${error.message}`);
            }
            if (stderr) {
               
                rej(`stderr in exec: ${stderr}`);
            }

            res(stdout);
        });
    });
};
