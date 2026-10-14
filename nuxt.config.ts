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
    fontSubsets: ['latin', 'latin-ext', 'chinese-simplified'],
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
        name: 'Noto Serif SC',
        provider: 'fontsource',
        weights: [400],
        styles: ['normal'],
        subsets: ['chinese-simplified'],
        global: true,
        preload: false,
      },
    ],
  },
})
