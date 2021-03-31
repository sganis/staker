const spawn = require('child_process').spawn;
const readFileSync = require('fs').readFileSync;



export function runLocal(cmd) {
    return new Promise(resolve => {
        console.log('running local command promise:' + cmd); 
        let result = { 
            cmd: cmd,
            stdout: '',
            stderr: '',
            rc : 0
        } 
        let stdout = '';
        let stderr = '';
        const p = spawn(cmd, { shell: true, encoding:'utf8' });
        p.on('error', function(error) {
            //console.log('Oh noez, teh errurz: ' + error);
            stderr = error;
        });
        p.stdout.on('data', (data) => {
            //console.log(`stdout: ${data}`);
            stdout += data;           
        });
        p.stderr.on('data', (data) => {
            //console.error(`stderr: ${data}`);
            stderr += data;           
        });
        p.on('close', (code) => {
            result = { 
                cmd: cmd,
                stdout: stdout.trim(),
                stderr: stderr.trim(),
                rc : code
            } 
            resolve(result);
        });
        
    })   
}

// to test jest
export function sum(a, b) {
    return a + b;
}

// export async function connectHost(host, user) {
//     console.log('connecting host: '+ host);
//     let r = await runRemote(host, user, 'hostname');
//     return r
// }