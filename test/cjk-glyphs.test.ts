import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { test } from 'node:test'
import { Renderer } from '@takumi-rs/core'

// U+6E9E 溞 is the ideograph in froq.me "透明溞不是老鼠".
// The chinese-simplified cut has the punctuation below and omits 溞.
const CULPRIT = '溞'
const PUNCTUATION = '—–·・「」『』，。、…～：；（）【】《》！？“”‘’•※　〇'
const TITLE = `透明${CULPRIT}不是老鼠`
const DESCRIPTION = `透明${CULPRIT}不是老鼠。可它第一次被我们看见时，确实先是老鼠。——「枝角类」·不是虾`

const FONT_DIR = new URL('../node_modules/@fontsource/noto-serif-sc/', import.meta.url)
const FULL_CSS = new URL('./400.css', FONT_DIR)
const SIMPLIFIED = new URL('./files/noto-serif-sc-chinese-simplified-400-normal.woff2', FONT_DIR)

interface Face {
  file: URL
  ranges: Array<[number, number]>
}

function parseRanges(value: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = []
  for (const part of value.split(',')) {
    const match = /U\+([0-9A-Fa-f]{1,6})(?:-([0-9A-Fa-f]{1,6}))?/i.exec(part.trim())
    if (!match)
      continue
    const start = Number.parseInt(match[1], 16)
    const end = match[2] ? Number.parseInt(match[2], 16) : start
    ranges.push([start, end])
  }
  return ranges
}

function parseFaces(css: string): Face[] {
  const faces: Face[] = []
  for (const block of css.split('@font-face').slice(1)) {
    const src = /url\(([^)]+\.woff2)\)/.exec(block)
    const range = /unicode-range:\s*([^;]+);/.exec(block)
    if (!src?.[1] || !range?.[1])
      continue
    faces.push({
      file: new URL(src[1], FULL_CSS),
      ranges: parseRanges(range[1]),
    })
  }
  return faces
}

function covers(faces: Face[], codePoint: number): boolean {
  return faces.some(face => face.ranges.some(([start, end]) => codePoint >= start && codePoint <= end))
}

function facesFor(faces: Face[], text: string): Face[] {
  const points = [...text].map(char => char.codePointAt(0) ?? 0)
  return faces.filter(face =>
    face.ranges.some(([start, end]) => points.some(point => point >= start && point <= end)),
  )
}

const faces = parseFaces(readFileSync(FULL_CSS, 'utf8'))

test('the full Noto Serif SC face covers 溞 and CJK punctuation', () => {
  assert.ok(faces.length > 50, `expected unicode-range slices, got ${faces.length}`)
  assert.equal(covers(faces, CULPRIT.codePointAt(0) ?? 0), true)
  for (const mark of PUNCTUATION) {
    const point = mark.codePointAt(0) ?? 0
    assert.equal(covers(faces, point), true, `U+${point.toString(16).toUpperCase()} ${mark} is missing from 400.css`)
  }
})

async function renderGlyph(text: string, fonts: Array<{ data: Buffer, ranges?: Array<[number, number]> }>): Promise<Buffer> {
  const renderer = new Renderer()
  for (const font of fonts) {
    await renderer.registerFont({
      name: 'Noto Serif SC',
      data: font.data,
      weight: 400,
      style: 'normal',
      ...font.ranges ? { unicodeRange: font.ranges } : {},
    })
  }
  return await renderer.render({
    type: 'container',
    style: {
      display: 'flex',
      width: '760px',
      backgroundColor: '#f4f2ec',
      padding: '24px',
    },
    children: [{
      type: 'text',
      text,
      style: {
        fontFamily: 'Noto Serif SC',
        fontSize: '76px',
        color: '#1a1917',
      },
    }],
  }, {
    width: 808,
    height: 160,
    format: 'png',
  })
}

test('溞 draws from the unicode-range slice and not the simplified cut', async () => {
  const needed = facesFor(faces, CULPRIT)
  assert.ok(needed.length > 0)
  const sliced = await renderGlyph(CULPRIT, needed.map(face => ({
    data: readFileSync(face.file),
    ranges: face.ranges,
  })))
  const simplified = await renderGlyph(CULPRIT, [{
    data: readFileSync(SIMPLIFIED),
  }])
  assert.notEqual(sliced.equals(simplified), true)
})

test('a card with 溞 and punctuation can be drawn', async () => {
  const text = `${TITLE}${DESCRIPTION}`
  const needed = facesFor(faces, text)
  const renderer = new Renderer()
  for (const face of needed) {
    await renderer.registerFont({
      name: 'Noto Serif SC',
      data: readFileSync(face.file),
      weight: 400,
      style: 'normal',
      unicodeRange: face.ranges,
    })
  }
  const png = await renderer.render({
    type: 'container',
    style: {
      display: 'flex',
      flexDirection: 'column',
      width: '1200px',
      height: '630px',
      backgroundColor: '#f4f2ec',
      padding: '72px 80px',
    },
    children: [
      {
        type: 'text',
        text: TITLE,
        style: {
          fontFamily: 'Noto Serif SC',
          fontSize: '76px',
          lineHeight: 1.2,
          color: '#1a1917',
          width: '760px',
        },
      },
      {
        type: 'text',
        text: DESCRIPTION,
        style: {
          fontFamily: 'Noto Serif SC',
          fontSize: '28px',
          lineHeight: 1.45,
          color: '#5c5a54',
          width: '760px',
          marginTop: '20px',
        },
      },
    ],
  }, {
    width: 1200,
    height: 630,
    format: 'png',
  })
  assert.ok(png.byteLength > 1000)
  if (process.env.WRITE_SAMPLE === '1')
    await writeFile(new URL('../samples/hyalina.png', import.meta.url), png)
})
