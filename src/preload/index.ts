import { contextBridge, ipcRenderer } from 'electron'
import { IPC, type Api, type AppInfo } from '../shared/ipc'

/**
 * Seule surface exposée au renderer. Aucun accès direct à Node ni à ipcRenderer :
 * chaque capacité est une fonction explicite et typée.
 */
const api: Api = {
  getAppInfo: () => ipcRenderer.invoke(IPC.getAppInfo) as Promise<AppInfo>
}

contextBridge.exposeInMainWorld('api', api)
