import { connections } from './ssh';
import {settings} from './background';
const path = require('path');
const spawn = require('child_process').spawn;





export async function runLocal(cmd) {
    return new Promise(resolve => {
        //console.log('running local command promise:' + cmd); 
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
            resolve({ 
                cmd: cmd,
                stdout: stdout.trim(),
                stderr: stderr.trim(),
                rc : code
            });
        });        
    })   
}

export async function runRemote(host, cmd) {
    let ssh = connections.get(host);
    if (!ssh) {
        return {stderr: 'no connection', stdout: '', rc : -1};
    }
    return ssh.exec(cmd);
}

export async function upload(host, src, dst) {
    let ssh = connections.get(host);
    if (!ssh) {
        return {stderr: 'no connection', stdout: '', rc : -1};
    }
    let appPath = settings.get('appPath');
    let srcFull = path.join(appPath,'resources/scripts', src);
    console.log('src:', srcFull);
    return ssh.upload(srcFull, dst);
}

export async function download(host, src, dst) {
    return null
}