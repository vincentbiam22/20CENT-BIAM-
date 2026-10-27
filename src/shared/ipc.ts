/**
 * Contrat IPC partagé entre le processus principal, le preload et le renderer.
 * Toute nouvelle communication passe par ce fichier (canaux + types).
 */

export const IPC = {
  getAppInfo: 'app:get-info'
} as const

export interface AppInfo {
  name: string
  version: string
  platform: string
  electron: string
  chrome: string
  node: string
}

/** API exposée au renderer via `window.api` (voir src/preload/index.ts). */
export interface Api {
  getAppInfo(): Promise<AppInfo>
}
