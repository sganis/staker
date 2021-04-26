const Client = require('ssh2').Client
const path = require('path')
var fs = require("fs"); 
const readFileSync = require('fs').readFileSync;
const homedir = process.env.USERPROFILE || process.env.HOME; 
const pkeypath = path.join(homedir, '.ssh', 'id_rsa');
import {settings} from './settings'
import {runLocal} from './command'

class Connections {
    constructor() {
        this.connections = {
            host: {
                node: null, // credentials
                connectionPool : [],
            }
        };
    }
    async disconnectAll(host) {
        this.connections[host].connectionPool.forEach(async (c) => {
            await c.close();
            console.log('connection disconnected.');
        })
    }
    getNode(host) {
        if (host in this.connections) {
            return this.connections[host].node;
        }
        return null;
    }
    get(host) {
        let ssh = null;
        if (host in this.connections) {
            ssh = this.connections[host].connectionPool.find(c => c.connected && !c.busy);
        }
        return ssh;
    }
    set(node, ssh) {
        if (!(node.host in this.connections)) {
            this.connections[node.host] = {};
            this.connections[node.host].connectionPool = [];    
        }
        let conn = this.connections[node.host].connectionPool.filter(c => c.connected)
        if (conn.length != this.connections[node.host].connectionPool) {
            console.log('cleaning disconnected connections...')
            this.connections[node.host].connectionPool = conn;
        }
        this.connections[node.host].node = node;
        this.connections[node.host].connectionPool.push(ssh);        
        console.log('number of connections for host '+ node.host +": " + this.connections[node.host].connectionPool.length);
    }
    async getCurrentConnection() {
        // fixme: find a different way to share this info
        let host = settings.get('current_node');
        // console.log('current host:', host)
        let ssh = this.get(host);
        if (!ssh) {
            let node = this.getNode(host);
            if (node) {
                console.log('creating new ssh connection...')
                let r = await connectHost(node.host,node.user,node.password);
                if (r.rc === 0) {
                    ssh = this.get(host);
                }
            }
        }
        return ssh;
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
        this.busy = false;
        if (this.pkeypath) {
            try {
                this.pkey = readFileSync(this.pkeypath);
            } catch (e) {
                console.log(e);
                this.pkey = '';
            }
        }        
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
                // create sftp
                that.conn.sftp((err, sftp) => {
                    if (err) {
                        console.log('error sftp: '+ err);
                        resolve({stderr: err, stdout: '',rc : -100 }); 
                    }
                    console.log('sftp connection created');
                    that.sftp = sftp; 
                });
                that.connected = true;                
                resolve({
                    stdout: '',
                    stderr: '',
                    rc : 0
                })
            })
            that.conn.on('close', (_) => {
                //console.log('ssh connection closed');
                that.connected = false;
                resolve({
                    stdout: '',
                    stderr: 'connection closed',
                    rc : 0
                });
            })
            that.conn.on('error', (e) => {
                let msg = `ssh connection error: ${e}`;
                if (e.level === 'client-timeout') {
                    msg = 'Timed out';
                } else if (e.level === 'client-socket') {
                    msg = 'Connection refused: '+ e;
                } else if (e.level === 'client-authentication') {
                    console.log(e);
                    msg = 'Authentication failed';
                }
                console.log(msg);
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
                keepaliveInterval: 30000
            });             
        })
    }

    async exec(cmd, prompt) {
        if (this.busy) {
            let err = 'connection busy'
            console.log(err);
            return {
                stderr: err, 
                rc : -1
            };
        }
        this.cmd = cmd;
        this.busy = true;
        let that = this;
        if (!that.connected) {
            let r = await that.connect();
            if (r.rc !== 0) {
                return {
                    stdout: r.stdout,
                    stderr: 'ssh exec not connected: '+ r.stderr,
                    rc : r.rc
                };
            }
        }
        return new Promise(resolve => {
            that.conn.exec(cmd, (err, stream) => {
                let stdout = '';
                let stderr = '';
                let stderr_line = '';
                if (err || !stream) {
                    that.busy = false;
                    return resolve({
                        cmd : cmd,
                        stderr: err,
                        stdout: '',
                        rc : -100
                    });
                }
                stream.on('close', (rc) => {
                    that.busy = false;
                    return resolve({ 
                        cmd: cmd,
                        stdout: stdout.trim(),
                        stderr: stderr.trim(),
                        rc : stderr.trim() || rc !==0 ? rc : 0,
                    } );
                });
                stream.on('data', (data) => {
                    stdout += data;           
                })
                stream.stderr.on('data', (data) => {
                    stderr += data;  
                    stderr_line += data;                      
                    if (prompt && stderr_line.indexOf(':')) {
                        console.log('stderr_line data: '+stderr_line);                        
                        prompt.forEach(p => {
                            if (stderr_line.includes(p.question)) {
                                stream.write(p.answer + '\n');
                                stderr_line = '';
                                console.log([p.answer]);
                            }
                        });
                        // console.log('stderr data2: '+data);                                                                 
                    }

                });
            });                
        })
    }

    async upload(src, dst) {
        console.log(`uploading ${src} -> ${dst}`);
        let that = this;
        if (!that.connected) {
            let r = await that.connect();
            if (r.rc !== 0) {
                console.log(r);
                return {stdout: '', stderr: 'Not connected to upload', rc : -1 }
            }
        }
        let stats = fs.statSync(src);
        if (stats.isDirectory()) {
            return this.uploadFolder(src,dst);
        } else {
            return new Promise(resolve => {
                that.sftp.fastPut(src, dst, (err) => {
                    let rc = 0;
                    if (err)
                        rc = -1
                    resolve({stderr: err, stdout: '', rc : rc });    
                });
                // that.conn.sftp((err, sftp) => {
                //     if (err) {
                //         console.log('error sftp: '+ err);
                //         resolve({stderr: err, stdout: '',rc : -100 }); 
                //     } else {
                //         let readStream = fs.createReadStream(src);
                //         let writeStream = sftp.createWriteStream(dst);        
                //         writeStream.on('close', () => {
                //             console.log('sftp close');
                //             resolve({stderr: '', stdout: '', rc : 0 });    
                //         });        
                //         // initiate transfer of file
                //         readStream.pipe( writeStream );
                //     }
                // });
            })
        }
    }
    async uploadFolder(src, dst) {
        console.log(`uploading folder ${src} -> ${dst}`);
        return new Promise(resolve => {
            fs.readdirSync(src).forEach(async (file) => {
                let srcfile = path.join(src, file);
                let dstfile = dst+'/' +file;
                console.log(srcfile, dstfile);
                let r = await this.upload(srcfile, dstfile);
                if (r.rc !==0) {
                    console.log(r);
                    resolve({ rc: -1, stderr: r.stderr })
                }
              });
              resolve({ rc: 0 })
        });        
    }

    async download(src, dst) {
        let that = this;
        if (!that.connected) {
            let r = await that.connect();
            if (r.rc !== 0) {
                return {stdout: '', stderr: 'Not connected: '+ r.stderr, rc : -1 };
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

export async function updatePassphrase(wallet_id, currentpass, newpass) {
    console.log('Updating passphrase...');
    let prompt = [
        { 
            question: 'current passphrase:',
            answer: currentpass,
        },
        { 
            question: 'new passphrase:',
            answer: newpass,
        },
        { 
            question: 'second time:',
            answer: newpass,
        },
    ]

    let cmd = `cardano-wallet wallet update passphrase ${wallet_id}`;
    let r = await runRemote(cmd, prompt);
    return r;
}

export async function generateKeys(user, host) {
    // todo
    console.log('Generating new ssh keys...');
    let seckey = pkeypath;
    let pubkey = pkeypath + '.pub';

}

export async function runRemote(cmd, prompt) {
    //console.log('running command:', cmd);
    let ssh = await connections.getCurrentConnection();
    if (!ssh) {
        let stderr = 'no connection';
        console.log(cmd + ' falied: '+ stderr);
        return {stderr: stderr, stdout: '', rc : -1};
    }
    return ssh.exec(cmd, prompt);
}

export async function connectHost(host, user, password) {
    console.log('connectHost', host, user);
    let ssh = new Ssh({host,user,password, timeout: 10000});
    let r = await ssh.connect();
    if (r.rc === 0) {    
        connections.set({host, user, password}, ssh);  
        // r.conn = ssh;
        // r = await ssh.exec('hostname');
    }
    return r;
}   
export async function disconnectHost(host) {
    await connections.disconnectAll(host);  
} 

export async function upload(src, dst) {
    let ssh = await connections.getCurrentConnection();
    if (!ssh) {
        return {stderr: 'no connection', stdout: '', rc : -1};
    }
    return ssh.upload(src, dst);
}

export async function download(src, dst) {
    // todo
    let ssh = await connections.getCurrentConnection();
    return null
}

export async function setupSsh() {
    let homedir = settings.get('homedir');
    let appPath = settings.get('appPath');
    let seckey = homedir + '\\.ssh\\id_rsa';
    let pubkey = homedir + '\\.ssh\\id_rsa.pub';

    let r = null;

    if (!fs.existsSync(seckey)) {
        let keygen = '';
        let cmd = '';
        if (process.platform === 'win32') {
            keygen = `${appPath}\\tool\\bin\\ssh-keygen.exe`;
            cmd = `mkdir ${homedir}\\.ssh 2>nul & ${keygen} -q -N "" -f ${seckey}`
        } else {
            keygen = 'ssh-keygen';
            cmd = `mkdir ${homedir}/.ssh >/dev/null; ${keygen} -q -N "" -f ${seckey}`
        }
        r = await runLocal(cmd);
        if (r.rc !== 0) {
            console.log(r); 
            return r;
        }            
    } 
    let pkeystr = readFileSync(pubkey, 'utf8');
    r = await runRemote(`mkdir -p .ssh; chmod 700 .ssh; echo "${pkeystr.trim()}" >> .ssh/authorized_keys; chmod 644 .ssh/authorized_keys`)
    if (r.rc !== 0) 
        console.log(r); 
    return r;
}

export async function createAddress(name) {
    // todo
    let ssh = await connections.getCurrentConnection();

}   
export async function createTransaction(from_addr, to_addr, ada, from_skey) {
    // todo
    let ssh = await connections.getCurrentConnection();

}   