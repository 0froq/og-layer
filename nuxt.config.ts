// Faces the host stylesheet may already load, or that only exist on the visitor's machine.
// Listing them stops `@nuxt/fonts` from downloading stand-ins.
const siteFaces = [
  'Geist',
  'Geist Variable',
  'Geist Mono Variable',
  'Iowan Old Style',
  'Georgia',
  'Songti SC',
  'Source Han Serif SC',
  'PingFang SC',
  'Hiragino Sans GB',
  'Noto Sans SC',
] as const

export default defineNuxtConfig({
  modules: [
    '@nuxt/fonts',
    'nuxt-og-image',
  ],

  ogImage: {
    zeroRuntime: true,
    defaults: {
      width: 1200,
      height: 630,
      extension: 'png',
    },
    // Satori/fontless only. Takumi takes unicode-range slices from `@nuxt/fonts`.
    // Han is not a named subset: `chinese-simplified` drops rare ideographs.
    fontSubsets: ['latin', 'latin-ext'],
    compatibility: {
      prerender: { browser: false },
    },
  },

  fonts: {
    providers: { google: false },
    // `--font-*` lists system CJK faces. Scanning them would try to fetch substitutes.
    processCSSVariables: false,
    defaults: {
      weights: [400],
      styles: ['normal'],
      preload: false,
      fallbacks: [],
    },
    families: [
      ...siteFaces.map(name => ({ name, provider: 'none' as const })),
      {
        name: 'Instrument Serif',
        provider: 'fontsource',
        weights: [400],
        styles: ['normal', 'italic'],
        subsets: ['latin', 'latin-ext'],
        global: true,
        preload: false,
      },
      {
        // Watermark only. True italic, not a slanted roman. OFL-1.1.
        // Notice: `@fontsource/eb-garamond/LICENSE` and `public/fonts/EB-Garamond-OFL.txt`.
        name: 'EB Garamond',
        provider: 'fontsource',
        weights: [400],
        styles: ['italic'],
        subsets: ['latin', 'latin-ext'],
        global: true,
        preload: false,
      },
      {
        name: 'Geist Mono',
        provider: 'fontsource',
        weights: [400],
        styles: ['normal'],
        subsets: ['latin', 'latin-ext'],
        global: true,
        preload: false,
      },
      {
        // `chinese-simplified` is a ~8k glyph cut. It has the usual punctuation
        // (em dash, fullwidth marks, middle dot, brackets) and common Han, and
        // it omits rarer ideographs such as U+6E9E 溞. `400.css` is the whole
        // face, one unicode-range slice per file. Takumi serves each codepoint
        // from the slice that contains it.
        name: 'Noto Serif SC',
        provider: 'npm',
        weights: [400],
        styles: ['normal'],
        global: true,
        preload: false,
        providerOptions: {
          npm: {
            package: '@fontsource/noto-serif-sc',
            file: '400.css',
          },
        },
      },
    ],
  },
})
