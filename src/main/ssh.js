const Client = require('ssh2').Client
const path = require('path')
const readFileSync = require('fs').readFileSync;
const homedir = process.env.USERPROFILE || process.env.HOME; 
const pkeypath = path.join(homedir, '.ssh', 'id_rsa');

class Connections {
    constructor() {
        this.connections = []
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
}
const connections= new Connections();
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
            that.conn.on('ready', function() {
                // auth success
                that.connected = true;
                resolve({
                    stdout: '',
                    stderr: '',
                    rc : 0
                })
            })
            that.conn.on('close', (e) => {
                resolve({
                    stdout: '',
                    stderr: 'connection closed',
                    rc : 0
                });
            })
            that.conn.on('error', function(e) {
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
            //console.log(`Reconnecting with cmd: ${cmd}...`);
            let r = await that.connect();
            if (r.rc !== 0) {
                return new Promise(resolve => {
                    resolve({
                        stdout: '',
                        stderr: 'Not connected',
                        rc : -1
                    });
                });
            }
        }
        return new Promise(resolve => {
            that.conn.exec(cmd, function(err, stream) {
                let stdout = '';
                let stderr = '';
                if (err) {
                    resolve({
                        cmd : cmd,
                        stderr: err,
                        stdout: '',
                        code : -100
                    });
                }
                stream.on('close', function(code, signal) {
                    resolve({ 
                        cmd: cmd,
                        stdout: stdout.trim(),
                        stderr: stderr.trim(),
                        rc : code
                    } );
                }).on('data', function(data) {
                    stdout += data;           
                }).stderr.on('data', function(data) {
                    stderr += data;
                });
            });                
        })
    }
}

export async function generateKeys(user, host) {
    console.log('Generating new ssh keys...');
    let seckey = pkeypath;
    let pubkey = pkeypath + '.pub';

}