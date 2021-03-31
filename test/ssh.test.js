const {SshClient} = require('../src/main/ssh');

describe.onWindows("Ssh tests", () => {
    test('constructor', async () => {
        let ssh = new SshClient({host:'192.168.100.203', user:'san'});
        expect(ssh.isConnected()).toEqual(false);
        await ssh.close();
    });
    test('connectHost', async () => {
        let ssh = new SshClient({host:'192.168.100.203', user:'san'});
        let r = await ssh.connectHost()
        console.log(r);
        console.log(ssh.isConnected());
        expect(ssh.isConnected()).toEqual(true);  
        await ssh.close();                    
    });
    test('connectHost timeout', async () => {
        let ssh = new SshClient({host:'192.168.100.203', user:'san', timeout:1});
        let r = await ssh.connectHost()
        expect(ssh.isConnected()).toEqual(false);
        expect(r.stderr).toEqual('Timed out');              
        await ssh.close();
    });
    test('connectHost wrong port', async () => {
        let ssh = new SshClient({host:'192.168.100.203', user:'san', port:24});
        let r = await ssh.connectHost()
        expect(ssh.isConnected()).toEqual(false);
        console.log(r.stderr);
        expect(r.stderr).toEqual('Connection refused');
        await ssh.close();
    });
});
