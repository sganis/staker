import {Ssh} from "./ssh"

// to test jest
export function sum(a, b) {
    return a + b;
}

export async function connectHost(host, user) {
    let ssh = new Ssh({host,user});
    return await ssh.connect();
}   

