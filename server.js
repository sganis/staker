const express = require('express');
const next = require('next');
const dev = process.env.NODE_ENV !== 'production';
const app = next({dev});
const handle = app.getRequestHandler();
const PORT = process.env.PORT || 3000;


const { spawn } = require('child_process');
const ls = spawn('cmd.exe', ['/c','dir']);

ls.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});
 
ls.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
}); 

app.prepare().then(() => {
    const server = express();
    
    server.get('/data', (req, res) => {
      const files = [
        {name : 'server.txt', type: 'file' },
        {name : 'server2.txt', type: 'file' },
        {name : 'server3.txt', type: 'file' },
        {name : 'server33.txt', type: 'dir' }
      ];
      console.log('data called');
      //app.render(req, res, '/files', params);
      // res.setHeader('Content-Type', 'application/json');
      // res.end(JSON.stringify({ files: files }));
      //return handle(req, res);
      res.json(files);
    });
    server.all('*', (req, res) => {
      //console.log('server running here...')
      return handle(req, res);
    });
 
    server.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`);
    });
}).catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
})


  
  
  