const Client = require('ssh2').Client
const path = require('path')
var fs = require("fs"); 
const readFileSync = require('fs').readFileSync;
const homedir = process.env.USERPROFILE || process.env.HOME; 
const pkeypath = path.join(homedir, '.ssh', 'id_rsa');
import {settings} from './settings'

class Connections {
    constructor() {
        this.connections = []
        this.current_host = '';
    }
    get(host) {
        let c = this.connections.find(c => c.host === host);
        return c ? c.ssh : null;
    }
    set(host, ssh) {
        let c = this.connections.find(c => c.host === host)
        if (!c) {
            this.connections.push({host,ssh});
        } else {
            c.ssh = ssh;
        }
    }   
    getCurrentConnection() {
        // fixme: find a different way to share this info
        let host = settings.get('current_node');
        console.log('current host:', host)
        return this.get(host);
    }
}
const connections = new Connections();
export {connections}

export class Ssh {
    constructor(args) {
        console.log(args);
        args = args || {}
        this.host = args.host;
        this.user = args.user;
        this.port = args.port || 22;
        this.pkeypath = args.pkeypath || pkeypath;
        this.password = args.password || '';
        this.cmd = '';
        this.timeout = args.timeout || 20000;
        this.connected = false;
        if (this.pkeypath) {
            try {
                this.pkey = readFileSync(this.pkeypath);
            } catch (e) {
                console.log(e);
                this.pkey = '';
            }
        }
        
    }

    isConnected() {
        return this.connected;
    }
    async close() {
        let that = this;
        return new Promise(resolve => {
            that.connected = false;
            resolve(that.conn ? that.conn.end() : false); 
        });        
    }

    async connect() {
        // connect and auth
        this.conn = new Client();
        let that = this;
        
        return new Promise(resolve => {
            that.conn.on('ready', () => {
                // auth success
                that.connected = true;
                resolve({
                    stdout: '',
                    stderr: '',
                    rc : 0
                })
            })
            that.conn.on('close', (_) => {
                resolve({
                    stdout: '',
                    stderr: 'connection closed',
                    rc : 0
                });
            })
            that.conn.on('error', (e) => {
                let msg = e.toString();
                if (e.level === 'client-timeout') {
                    msg = 'Timed out';
                } else if (e.level === 'client-socket') {
                    msg = 'Connection refused';
                } else if (e.level === 'client-authentication') {
                    msg = 'Authentication failed';
                } else {
                    console.log('Error here: '+ e);
                }
                that.connected = false;
                resolve({
                    stdout: '',
                    stderr: msg,
                    rc : -1
                })
            })
            that.conn.connect({
                host: that.host,
                port: that.port,
                username: that.user,
                password: that.password,
                privateKey: that.pkey,
                readyTimeout: that.timeout, 
                keepaliveInterval: 60000
            }); 
        })
    }

    async exec(cmd) {
        let that = this;
        this.cmd = cmd;
        if (!that.connected) {
            let r = await that.connect();
            if (r.rc !== 0) {
                return {
                    stdout: '',
                    stderr: 'Not connected',
                    rc : -1
                };
            }
        }
        return new Promise(resolve => {
            that.conn.exec(cmd, (err, stream) => {
                let stdout = '';
                let stderr = '';
                if (err || !stream) {
                    resolve({
                        cmd : cmd,
                        stderr: err,
                        stdout: '',
                        rc : -100
                    });
                }
                stream.on('close', (rc) => {
                    resolve({ 
                        cmd: cmd,
                        stdout: stdout.trim(),
                        stderr: stderr.trim(),
                        rc : strerr.trim() || rc !==0 ? rc : 0,
                    } );
                }).on('data', (data) => {
                    stdout += data;           
                }).stderr.on('data', (data) => {
                    stderr += data;
                });
            });                
        })
    }

    async upload(src, dst) {
        let that = this;
        if (!that.connected) {
            let r = await that.connect();
            if (r.rc !== 0) {
                return {stdout: '', stderr: 'Not connected', rc : -1 }
            }
        }
        return new Promise(resolve => {
            that.conn.sftp((err, sftp) => {
                if (err) {
                    resolve({stderr: err, stdout: '',rc : -100 });                    
                }
                let readStream = fs.createReadStream(src);
                let writeStream = sftp.createWriteStream(dst);        
                writeStream.on('close', () => {
                    resolve({stderr: '', stdout: '', rc : 0 });    
                });        
                // initiate transfer of file
                readStream.pipe( writeStream );
            });
        })
    }
    
    async download(src, dst) {
        let that = this;
        if (!that.connected) {
            let r = await that.connect();
            if (r.rc !== 0) {
                return {stdout: '', stderr: 'Not connected', rc : -1 };
            }
        }
    
        return new Promise(resolve => {
            that.conn.sftp((err, sftp) => {
                if (err) {
                    resolve({stderr: err, stdout: '',rc : -100 });                    
                }
                sftp.fastGet(src, dst, {}, (err) => {
                    if(err) {
                        resolve({stderr: err, stdout: '',rc : -100 });
                    } else {
                        resolve({stderr: '', stdout: '', rc : 0 });
                    }
                });
            });
        })
    }
}

export async function generateKeys(user, host) {
    // todo
    console.log('Generating new ssh keys...');
    let seckey = pkeypath;
    let pubkey = pkeypath + '.pub';

}

export async function runRemote(cmd) {
    console.log('running command:', cmd);
    let ssh = connections.getCurrentConnection();
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


export async function upload(src, dst) {
    let ssh = connections.getCurrentConnection();
    if (!ssh) {
        return {stderr: 'no connection', stdout: '', rc : -1};
    }
    return ssh.upload(src, dst);
}

export async function download(src, dst) {
    // todo
    let ssh = connections.getCurrentConnection();
    return null
}

export async function setupSsh(host, user) {
    // todo
    return new Promise(resolve => { setTimeout(resolve, 3000, {rc: -1}) });
}

export async function createAddress(name) {
    // todo
    let ssh = connections.getCurrentConnection();

}   
export async function createTransaction(from_addr, to_addr, ada, from_skey) {
    // todo
    let ssh = connections.getCurrentConnection();

}   