import { connections, Ssh } from './ssh';
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

export async function connectHost(host, user, password) {
    console.log('connectHost', host, user, password);
    let ssh = new Ssh({host,user,password, timeout: 10000});
    let r = await ssh.connect();
    if (r.rc === 0) {    
        connections.set(host, ssh);  
        r = await ssh.exec('hostname');
    }
    return r;
}   


export async function upload(host, src, dst) {
    let ssh = connections.get(host);
    if (!ssh) {
        return {stderr: 'no connection', stdout: '', rc : -1};
    }
    return ssh.upload(src, dst);
}

export async function download(host, src, dst) {
    return null
}

export async function setupSsh(host, user) {
    return new Promise(resolve => { setTimeout(resolve, 3000, {rc: -1}) });
}

