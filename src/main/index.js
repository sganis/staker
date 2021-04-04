'use strict'
import { app, protocol, BrowserWindow} from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import {runLocal, runRemote} from '@/main/command'
import {connectHost} from '@/main/util'
import {IPC} from '@/common/constants'
import {Settings} from '@/main/settings';

const {ipcMain, Notification} = require('electron');

const path = require('path');
const os = require('os');

// settings
const settings = new Settings({
  configName: 'config',
  defaults: {
    windowBounds: { x: 0, y: 0, width: 800, height: 600 },
  }
});

const isDevelopment = process.env.NODE_ENV !== 'production'
const username = settings.get('username') || os.userInfo().username.toLocaleLowerCase();
const homedir = process.env.USERPROFILE || process.env.HOME; 
const pkeypath = path.join(homedir, '.ssh', 'id_rsa');

settings.set('username', username);
settings.set('homedir', homedir);
settings.set('pkeypath', pkeypath);
settings.set('isDevelopment', isDevelopment);


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
  // The BrowserWindow class extends the node.js core EventEmitter class, so we use that API
  // to listen to events on the BrowserWindow. The resize event is emitted when the window size changes.
  win.on('close', () => {
    // The event doesn't pass us the window size, so we call the `getBounds` method which returns an object with
    // the height, width, and x and y coordinates.
    let rect = win.getBounds();
    // Now that we have them, save them using the `set` method.
    settings.set('windowBounds', rect);
  });


  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
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
ipcMain.on(IPC.GET_NODES, (e) => {  e.returnValue = settings.get('nodes');});

// async/await reply to invoke
ipcMain.handle(IPC.RUN_LOCAL, async (_, ...args) => { return await runLocal(...args);});
ipcMain.handle(IPC.RUN_REMOTE, async (_, ...args) => { return await runRemote(...args);});
ipcMain.handle(IPC.CONNECT_HOST, async (_, ...args) => { return await connectHost(...args);});



