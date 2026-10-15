import type { Nuxt } from 'nuxt/schema'
import { attachNotoSlices, type NotoSliceTarget } from './noto-slices'

// Registered before `nuxt-og-image` so the extra slices are already on the
// family when that module copies `font.files`.
export default function cjkSlices(_options: unknown, nuxt: Nuxt) {
  const hook = nuxt.hook as (name: string, callback: (font: NotoSliceTarget) => void) => void
  hook('fonts:resolved', attachNotoSlices)
}
