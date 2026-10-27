import type { CSSProperties } from 'react'

export type IconName = 'files' | 'search' | 'branch' | 'blocks' | 'settings' | 'chevron' | 'plus' | 'folder' | 'terminal' | 'play' | 'spark' | 'arrow' | 'close' | 'check' | 'code' | 'help' | 'download' | 'book' | 'external' | 'panel' | 'file' | 'home'

const paths: Record<IconName, string> = {
  files: 'M8 3h9l4 4v13H8z M17 3v5h4 M4 7H3v14h12',
  search: 'M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15 M16 16l5 5',
  branch: 'M6 7v10 M18 7v2c0 5-12 1-12 6 M6 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4 M18 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4 M6 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4',
  blocks: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  settings: 'M9 3h6l1 4 4 1v7l-4 1-1 5H9l-1-5-4-1V8l4-1z M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8',
  chevron: 'm9 5 7 7-7 7', plus: 'M12 5v14 M5 12h14', folder: 'M3 7V4h6l3 3h9v13H3z',
  terminal: 'm4 6 5 6-5 6 M12 18h8', play: 'm8 4 12 8-12 8z',
  spark: 'm12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z',
  arrow: 'M4 12h16 m-6-6 6 6-6 6', close: 'm6 6 12 12 M6 18 18 6', check: 'm4 12 5 5L20 6',
  code: 'm8 6-6 6 6 6 M16 6l6 6-6 6 M14 3l-4 18',
  help: 'M9 8a3 3 0 1 1 4 3c-1 1-1 2-1 3 M12 17v1 M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20',
  download: 'M12 3v12 m-5-5 5 5 5-5 M4 16v5h16v-5',
  book: 'M12 5v16 M12 5c-3-2-6-2-10-1v15c4-1 7-1 10 2 3-3 6-3 10-2V4c-4-1-7-1-10 1',
  external: 'M14 3h7v7 M21 3l-11 11 M10 3H3v18h18v-7', panel: 'M3 4h18v16H3z M15 4v16',
  file: 'M5 3h9l5 5v13H5z M14 3v6h5', home: 'm3 10 9-7 9 7 M5 9v12h14V9 M9 21v-7h6v7'
}

export function Icon({ name, size = 18, style }: { name: IconName; size?: number; style?: CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}><path d={paths[name]} /></svg>
}
