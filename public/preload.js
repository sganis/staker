const { contextBridge, ipcRenderer } = require('electron');

const channels = [
  'READ_FILE', 
  'RUN_LOCAL',
  'RUN_REMOTE',
];

contextBridge.exposeInMainWorld(
  'ipc', {
    send: (channel, data) => {
      if (channels.includes(channel)) {
        ipcRenderer.send(channel, data);
      } else {
        console.log('invalid send channel: ' + channel);
      }
    },
    invoke: (channel, ...args) => {
      if (channels.includes(channel)) {
        return ipcRenderer.invoke(channel, ...args);
      } else {
        console.log('invalid send channel: ' + channel);
      }
    },
    on: (channel, func) => {
      if (channels.includes(channel)) {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      } else {
        console.log('invalid reply channel: ' + channel);
      }
    },
  },
);