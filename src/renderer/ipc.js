import {IPC} from '@/shared/constants'

export async function runLocal (cmd) {
    return await window.ipc.invoke(IPC.RUN_LOCAL, cmd);
}

export async function runRemote(cmd) {
    return await window.ipc.invoke(IPC.RUN_REMOTE, cmd);
}
