//import {settings} from "./settings"
const spawn = require('child_process').spawn;


export async function runLocal(cmd, prompt) {
    return new Promise(resolve => {
        console.log('running local command promise: ' + cmd); 
        let stdout = '';
        let stderr = '';
        let stderr_line = '';
        let stdout_line = '';

        const stream = spawn(cmd, { shell: true });
        stream.on('error', function(error) {
            console.log('runLocal error: ' + error);yarn
            reject({
                cmd: cmd,
                stdout: '',
                stderr: error,
                rc : -1
            });
        });
        stream.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
            stdout += data;
            stdout_line += data;                      
            if (prompt && stdout_line.indexOf(':')) {
                console.log('stdout_line data: '+stdout_line);                        
                prompt.forEach(p => {
                    if (stdout_line.includes(p.question)) {
                        //console.log('question found, sending: '+p.answer);                        
                        
                        stream.stdin.write(p.answer + '\r\n');
                        stdout_line = '';
                        console.log([p.answer]);
                    }
                });
                // console.log('stderr data2: '+data);                                                                 
            }           
        });
        stream.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
            stderr += data;   
            stderr_line += data;                      
            if (prompt && stderr_line.indexOf(':')) {
                console.log('stderr_line data: '+stderr_line);                        
                prompt.forEach(p => {
                    if (stderr_line.includes(p.question)) {
                        //console.log('question found, sending: '+p.answer);                        
                        
                        stream.stdin.write(p.answer + '\r\n');
                        stderr_line = '';
                        console.log([p.answer]);
                    }
                });
                // console.log('stderr data2: '+data);                                                                 
            }        
        });
        stream.on('close', (code) => {
            console.log(`runLocal close with code: ${code}`);
            stream.stdin.end()
            resolve({ 
                cmd: cmd,
                stdout: stdout.trim(),
                stderr: stderr.trim(),
                rc : code
            });
        });        
    })   
}

