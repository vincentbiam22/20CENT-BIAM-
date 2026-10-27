import type { AppInfo } from './ipc'

/** Formate les informations de l'application pour l'affichage. */
export function formatAppInfo(info: AppInfo): string {
  return `${info.name} ${info.version} — Electron ${info.electron} · Chromium ${info.chrome} · Node ${info.node} (${info.platform})`
}
