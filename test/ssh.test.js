const {Ssh} = require('../src/main/ssh');
const path = require('path');
const { runLocal } = require('../src/main/command');

const homedir = process.env.USERPROFILE || process.env.HOME; 
const pkeypath = path.join(homedir, '.ssh', 'id_rsa');
const HOSTNAME = '192.168.100.203';
const USER = 'san';

describe.onWindows("Ssh tests", () => {
    test('Constructor', async () => {
        let ssh = new Ssh({host:HOSTNAME, user:USER});
        expect(ssh.isConnected()).toEqual(false);
        await ssh.close();
    });
    test('Connect', async () => {
        let ssh = new Ssh({host:HOSTNAME, user:USER, pkeypath: pkeypath});
        let r = await ssh.connect()
        expect(ssh.isConnected()).toEqual(true);  
        await ssh.close();                    
    });
    test('Connect timeout', async () => {
        let ssh = new Ssh({host:HOSTNAME, user:USER, timeout:1});
        let r = await ssh.connect()
        expect(ssh.isConnected()).toEqual(false);
        expect(r.stderr).toEqual('Timed out');              
        await ssh.close();
    });
    test('Connect wrong port', async () => {
        let ssh = new Ssh({host:HOSTNAME, user:USER, port:24});
        let r = await ssh.connect()
        expect(ssh.isConnected()).toEqual(false);
        expect(r.stderr).toEqual('Connection refused');
        await ssh.close();
    });
    test('Run command', async () => {
        let ssh = new Ssh({host:HOSTNAME, user:USER, pkeypath: pkeypath});
        let r = await ssh.connect()
        expect(ssh.isConnected()).toEqual(true);
        r = await ssh.exec('echo ok')
        expect(r.stdout).toBe('ok');
        r = await ssh.exec('echo hello')
        expect(r.stdout).toBe('hello');
        r = await ssh.exec('echo hello >/dev/null')
        expect(r.stdout).toBe('');
        
        await ssh.close();
    });
    test('Reconnect', async () => {
        let ssh = new Ssh({host:HOSTNAME, user:USER, pkeypath: pkeypath});
        let r = await ssh.connect()
        expect(ssh.isConnected()).toEqual(true);
        await ssh.close();
        expect(ssh.isConnected()).toEqual(false);
        r = await ssh.exec('echo ok')
        expect(r.stdout).toBe('ok');      
        expect(ssh.isConnected()).toEqual(true);
        await ssh.close();
        expect(ssh.isConnected()).toEqual(false);
        
    });

    test('Parralel connect', async () => {
        let ssh = new Ssh({host:HOSTNAME, user:USER, pkeypath: pkeypath});
        await ssh.connect()
        expect(ssh.isConnected()).toEqual(true);
        const arr = Array.from(Array(10).keys());
        const rr = await Promise.all(
            arr.map(async (i) => {
                return await ssh.exec('echo '+ i);
            }));
        //console.log(rr);
        for (let [index, r] of rr.entries()) {
            expect(r.stdout).toBe(index.toString());
        } 
    });
    test('Download/upload file', async () => {
        let ssh = new Ssh({host:HOSTNAME, user:USER, pkeypath: pkeypath});
        let r = await ssh.connect()
        expect(ssh.isConnected()).toEqual(true);
        r = await ssh.download('/etc/os-release','os-release');
        expect(r.rc).toBe(0);       
        r = await ssh.upload('os-release','os-release');
        expect(r.rc).toBe(0);       
        r = await ssh.exec('diff /etc/os-release os-release');
        expect(r.stderr).toBe('');
        expect(r.rc).toBe(0);        
        await ssh.close();
        runLocal('del os-release');
    });

    test('Nothing', async () => {
        let r = true;
        expect(r).toBe(true);      
    });
});
