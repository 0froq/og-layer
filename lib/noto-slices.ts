import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

// `chinese-simplified` is one file and omits rarer ideographs (U+6E9E 溞).
// `400.css` is the whole weight-400 face, one unicode-range slice per file.
// Page CSS keeps the small cut. Share cards receive the slices as well.

const require = createRequire(import.meta.url)
const FAMILY = 'Noto Serif SC'

export interface NotoSlice {
  url: string
  file: string
  ranges: string[]
}

interface SliceFace {
  src: Array<{ url?: string, format?: string } | { name: string }>
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional'
  weight?: string | number | [number, number]
  style?: string
  unicodeRange?: string[]
}

export interface NotoSliceTarget {
  fontFamily: string
  fonts: SliceFace[]
  files: Array<{ url: string, readFont: () => Promise<Buffer> }>
}

let cached: NotoSlice[] | undefined

export function loadNotoSerifSlices(): NotoSlice[] {
  if (cached)
    return cached
  const cssPath = require.resolve('@fontsource/noto-serif-sc/400.css')
  const cssDir = dirname(cssPath)
  const css = readFileSync(cssPath, 'utf8')
  const slices: NotoSlice[] = []
  for (const block of css.split('@font-face').slice(1)) {
    const src = /url\(\.\/(files\/[^)]+\.woff2)\)/.exec(block)
    const range = /unicode-range:\s*([^;]+);/.exec(block)
    if (!src?.[1] || !range?.[1])
      continue
    const filename = src[1].slice(src[1].lastIndexOf('/') + 1)
    slices.push({
      url: `/_og-noto/${filename}`,
      file: join(cssDir, src[1]),
      ranges: range[1].split(',').map(part => part.trim()).filter(Boolean),
    })
  }
  cached = slices
  return slices
}

export function attachNotoSlices(font: NotoSliceTarget): void {
  if (font.fontFamily !== FAMILY)
    return
  const seen = new Set<string>()
  for (const face of font.fonts) {
    for (const source of face.src) {
      if ('url' in source && source.url)
        seen.add(source.url)
    }
  }
  for (const slice of loadNotoSerifSlices()) {
    if (seen.has(slice.url))
      continue
    font.fonts.push({
      src: [{ url: slice.url, format: 'woff2' }],
      display: 'swap',
      weight: 400,
      style: 'normal',
      unicodeRange: slice.ranges,
    })
    font.files.push({
      url: slice.url,
      readFont: () => readFile(slice.file),
    })
  }
}
