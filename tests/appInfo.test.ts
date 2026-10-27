import { describe, expect, it } from 'vitest'
import { formatAppInfo } from '../src/shared/appInfo'

describe('formatAppInfo', () => {
  it('formate les informations de l’application sur une ligne', () => {
    const text = formatAppInfo({
      name: '20Code',
      version: '0.1.0',
      platform: 'win32',
      electron: '33.2.0',
      chrome: '130.0.0.0',
      node: '20.18.0'
    })
    expect(text).toBe(
      '20Code 0.1.0 — Electron 33.2.0 · Chromium 130.0.0.0 · Node 20.18.0 (win32)'
    )
  })
})
