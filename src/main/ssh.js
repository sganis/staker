const Client = require('ssh2').Client
const readFileSync = require('fs').readFileSync;

export class Ssh {
    constructor(args) {
        args = args || {}
        this.host = args.host;
        this.user = args.user;
        this.port = args.port || 22;
        this.pkeypath = args.pkeypath || null;
        this.pass = args.pass || null;
        this.cmd = '';
        this.timeout = args.timeout || 20000;
        this.connected = false;
        this.conn = new Client();
        if (this.pkeypath) {
            try {
                this.pkey = readFileSync(this.pkeypath);
            } catch (e) {
                console.log(e);
            }
        }
        
    }

    isConnected() {
        return this.connected;
    }
    close() {
        let that = this;
        return new Promise(resolve => { resolve(that.conn.end()) });        
    }
    connectHost() {
        let that = this;
        return new Promise(resolve => {
            that.conn.on('ready', function() {
                // auth success
                that.connected = true;
                console.log('setting connected to true');
                resolve({
                    stdout: '',
                    stderr: '',
                    rc : 0
                })
            })
            that.conn.on('close', (e) => {
                //console.log('connection closed.');
                resolve();
            })
            that.conn.on('error', function(e) {
                console.log(e);            
                console.log('error, level: '+ e.level +', desc: '+ e.description);            
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
                host: this.host,
                port: this.port,
                username: this.user,
                privateKey: this.pkey,
                readyTimeout: this.timeout, 
            }); 
        })
    }
    
    exec(cmd, timeout=20000) {
        this.timeout = timeout;
        this.cmd = cmd;
        if (!connected) {
            this.conn.connect({
                host: this.host,
                port: this.port,
                username: this.user,
                privateKey: this.pkey,
                readyTimeout: this.timeout_ms,
            });
        }
    }
}

export function connectHost(host, user) {
    return new Promise(resolve => {
        var conn = new Client();

        conn.on('ready', function() {
            // auth success
            resolve(true)
        })
        conn.on('error', function(e) {
            console.log(e);            
            console.log('error, level: '+ e.level +', desc: '+ e.description);            
            let msg = e.toString();
            if (e.level === 'client-timeout') {
                msg = 'Timed out';
            } else if (e.level === 'client-socket') {
                msg = 'Connection refused';
            } else if (e.level === 'client-authentication') {
                msg = 'Authentication failed';
            }
            resolve({
                stdout: '',
                stderr: msg,
                rc : -1
            })
        })
        conn.connect({
            host: host,
            port: 22,
            username: user,
            privateKey: pkey,
            readyTimeout: 5000, // 2 secs
        });    
    })
}


