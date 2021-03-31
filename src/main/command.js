const spawn = require('child_process').spawn;

export function runLocal(cmd) {
    return new Promise(resolve => {
        console.log('running local command promise:' + cmd); 
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


export function runRemote(host, user, cmd) {
    return new Promise(resolve => {
        console.log(cmd); 
        let pkey = readFileSync(pkeypath);
        var conn = new Client();
        let result = { 
            cmd: cmd,
            stdout: '',
            stderr: '',
            rc : 0
        } 
        conn.on('ready', function() {
        //console.log('Client :: ready');
        let stdout = '';
        let stderr = '';
        conn.exec(cmd, function(err, stream) {
            if (err) {
                result.stderr= err;
                result.code = -100;
                resolve(result);
            }
            stream.on('close', function(code, signal) {
                conn.end();
                result = { 
                    cmd: cmd,
                    stdout: stdout.trim(),
                    stderr: stderr.trim(),
                    rc : code
                } 
                resolve(result);
            }).on('data', function(data) {
                //console.log('stdout:' + data);
                stdout += data;           
            }).stderr.on('data', function(data) {
                //console.log('sterr:' + data);
                stderr += data;
            });
        });
        }).connect({
            host: host,
            port: 22,
            username: user,
            privateKey: pkey
        });    
    })
}
