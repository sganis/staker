'use strict'
import { app, protocol, BrowserWindow, Notification, ipcMain} from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import {runLocal} from './command'
import { 
  runRemote, upload, download, connectHost, disconnectHost, setupSsh, 
  createAddress, createTransaction
} from './ssh'
import {IPC} from '../common/constants'
import {settings} from './settings';
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('process.env.NODE_ENV:', process.env.NODE_ENV);
console.log('app.getAppPath()    :', app.getAppPath());
console.log('app.getPath(exe)    :', app.getPath('exe'));

const appPath = process.env.NODE_ENV !== 'production' 
  ? path.join(app.getAppPath(),'..') 
  : path.join(app.getAppPath(),'../..');

let version_file =  path.join(appPath,'tool','bin','version.txt');
let version = ''
if (fs.existsSync(version_file))
    version = fs.readFileSync(version_file, 'utf8').trim();
else
    version = '0'


// settings
// const settings = new Settings({
//   configName: 'config',
//   defaults: {
//     windowBounds: { x: 0, y: 0, width: 800, height: 600 },
//   }
// });

const isDevelopment = process.env.NODE_ENV !== 'production'
const user = settings.get('user') || os.userInfo().username.toLocaleLowerCase();
const homedir = process.env.USERPROFILE || process.env.HOME; 
const pkeypath = path.join(homedir, '.ssh', 'id_rsa');

const isWin = process.platform === "win32";
const isMac = process.platform === "darwin";
const isLinux = process.platform === "linux";

settings.set('user', user);
settings.set('homedir', homedir);
settings.set('pkeypath', pkeypath);
settings.set('isDevelopment', isDevelopment);
settings.set('appPath', appPath);
settings.set('version', version);

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])


async function createWindow() {
  const {x, y, width, height} = settings.get('windowBounds');
  // Create the browser window.
  const win = new BrowserWindow({
    width: width,
    height: height,    
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      //preload: path.resolve(__static, 'preload.js'),
      preload: path.join(__dirname, './preload.js'),
    },
  })
  // window position
  win.setPosition(x, y);
  win.on('close', () => {
    let rect = win.getBounds();
    settings.set('windowBounds', rect);
  });


  if (process.env.WEBPACK_DEV_SERVER_URL) {
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    win.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}


// IPC
// sync reply to sendSync
ipcMain.on(IPC.GET_SETTINGS, (e, key, defaults) => { 
  e.returnValue = settings.get(key, defaults);
});
ipcMain.on(IPC.SET_SETTINGS, (e, key, value) => { 
  settings.set(key, value);  
  e.returnValue = value;
});
ipcMain.on(IPC.NOTIFY, (_, title, msg) => { 
  new Notification({title: 'Staker', subtitle: title, body: msg, silent: true}).show() ;
});
ipcMain.on(IPC.GET_NODES, (e) => { 
  console.log('GET_NODES: '+ settings.get('nodes'));
  e.returnValue = settings.get('nodes');
});

ipcMain.on(IPC.GET_POOLS, (e) => { 
  // TODO, not implemented
  e.returnValue = [{name: "Defualt Pool"}];
  //console.log('GET_POOLS: '+ settings.get('pools'));
  //e.returnValue = settings.get('pools');
});

// async/await reply to invoke
ipcMain.handle(IPC.RUN_LOCAL, async (_, ...args) => { return await runLocal(...args);});
ipcMain.handle(IPC.RUN_REMOTE, async (_, ...args) => { return await runRemote(...args);});
ipcMain.handle(IPC.UPLOAD, async (_, ...args) => { return await upload(...args);});
ipcMain.handle(IPC.DOWNLOAD, async (_, ...args) => { return await download(...args);});
ipcMain.handle(IPC.CONNECT_HOST, async (_, ...args) => { return await connectHost(...args);});
ipcMain.handle(IPC.DISCONNECT_HOST, async (_, ...args) => { return await disconnectHost(...args);});
ipcMain.handle(IPC.SETUP_SSH, async (_, ...args) => { return await setupSsh(...args);});
ipcMain.handle(IPC.CREATE_ADDRESS, async (_, ...args) => { return await createAddress(...args);});
ipcMain.handle(IPC.CREATE_TRANSACTION, async (_, ...args) => { return await createTransaction(...args);});



export {
  appPath,
  settings,
};
