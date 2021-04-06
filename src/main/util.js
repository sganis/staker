import {Ssh} from "./ssh"

// to test jest
export function sum(a, b) {
    return a + b;
}

export async function connectHost(host, user, password) {
    console.log('connectHost', host, user, password);
    let ssh = new Ssh({host,user,password, timeout: 10000});
    let r = await ssh.connect();
    if (r.rc === 0) {        
        r = await ssh.exec('hostname');
        //r.object = ssh;
        
    }
    return r;
}   

