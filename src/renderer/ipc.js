import {IPC} from '@/common/constants'

// sync
// settings
export function getSettings(key, defaults='') {
  return window.ipc.sendSync(IPC.GET_SETTINGS, key, defaults);
}
export function setSettings(key, value) {
  return window.ipc.sendSync(IPC.SET_SETTINGS, key, value);
}

// async/await
export async function runLocal (cmd) { return await window.ipc.invoke(IPC.RUN_LOCAL, cmd);}
export async function runRemote(...args) { return await window.ipc.invoke(IPC.RUN_REMOTE, ...args);}
export async function upload(...args) { return await window.ipc.invoke(IPC.UPLOAD, ...args);}
export async function download(...args) { return await window.ipc.invoke(IPC.DOWNLOAD, ...args);}
export async function connectHost (...args) { return await window.ipc.invoke(IPC.CONNECT_HOST, ...args);}
export async function notify (message) { return window.ipc.invoke(IPC.NOTIFY, message);}
