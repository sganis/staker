const { contextBridge, ipcRenderer } = require('electron');
//import {IPC} from "../src/shared/constants"

// duplicated from @/shared/constants
const IPC = {
  SETTINGS : "SETTINGS",
  RUN_LOCAL : "RUN_LOCAL",
  RUN_REMOTE : "RUN_REMOTE",
}

contextBridge.exposeInMainWorld(
  'ipc', {
    send: (channel, ...args) => {
      if (channel in IPC) {
        ipcRenderer.send(channel, ...args);
      } else {
        console.log('invalid send channel: ' + channel);
      }
    },
    sendSync: (channel, ...args) => {
      if (channel in IPC) {
        return ipcRenderer.sendSync(channel, ...args);
      } else {
        console.log('invalid send channel: ' + channel);
      }
    },
    invoke: (channel, ...args) => {
      if (channel in IPC) {
        return ipcRenderer.invoke(channel, ...args);
      } else {
        console.log('invalid send channel: ' + channel);
      }
    },
    on: (channel, func) => {
      if (channel in IPC) {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      } else {
        console.log('invalid reply channel: ' + channel);
      }
    },
  },
);