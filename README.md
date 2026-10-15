# @froq/og-covers-layer

Self-contained Nuxt layer for **nuxt-og-image v7** share cards (Takumi renderer).

## Use

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  extends: [
    ['github:0froq/og-layer#v0.1.0', { install: true }],
  ],
  site: {
    url: 'https://your-worker.workers.dev', // absolute `og:image` origin
    name: 'your-site',
  },
  devtools: { enabled: true }, // OG Image tab in DevTools
})
```

Import `countCardWords` from `@froq/og-covers-layer/card-words` in host `nuxt.config` hooks (add a `github:` dependency on this repo if your package manager does not hoist the layer).

## Site-specific values

Configure in the host app:

| Setting            | Where                                | Purpose                                                  |
| ------------------ | ------------------------------------ | -------------------------------------------------------- |
| Share image origin | `site.url` (Nuxt Site Config)        | Absolute `og:image` / `twitter:image` host               |
| i18n `baseUrl`     | `i18n.baseUrl`                       | Match `site.url` when using `@nuxtjs/i18n`               |
| Canonical origin   | host `useShareMeta` / `canonicalUrl` | `og:url` (often a different domain than images)          |
| Watermark text     | `app.config` → `ogCovers.mark`       | Bottom-right mark (default `froQ`)                       |
| Card colors        | `app.config` → `ogCovers.colors`     | Paper card palette (defaults match froQ void)            |
| Public share files | `runtimeConfig.public.publicFiles`   | List of image paths under `public/` for cover precedence |

## Cover precedence

For each content entry:

1. Frontmatter `cover` (https URL or existing `public/` path)
2. Frontmatter `ogImage.url`
3. `public/covers/<collection>/<locale>/<slug>.png` when present
4. Generated card via `defineOgImage` (`Paper.takumi.vue`)

`ogImage: false` skips the generated image.

The generated card draws frontmatter `description` under the title (`paperFields(page, siteDescription)` falls back to the site description). The line is smaller and lower contrast than the title, clamped to two lines with an ellipsis, and omitted when both sources are blank. Pass it from the host:

```ts
defineOgImage('Paper', {
  title: () => paperFields(page, siteDescription).title,
  description: () => paperFields(page, siteDescription).description,
})
```

## Content pages

Auto-imported helpers from this layer:

- `contentOgOverride`, `explicitContentCover`, `paperFields`, `cardDescription`, `ogComponentName`, `ogExtraProps`
- `countCardWords` — import `@froq/og-covers-layer/card-words` in `nuxt.config` hooks

## Fonts

The layer registers Instrument Serif (title), Noto Serif SC (Han), Geist Mono (meta), and EB Garamond italic 400 (watermark). The OFL notice for EB Garamond ships in `public/fonts/EB-Garamond-OFL.txt` (font license only; layer source is MIT).

## License

Layer source code is [MIT](LICENSE). EB Garamond used on share cards is under SIL OFL-1.1 (`public/fonts/EB-Garamond-OFL.txt`).

Pin releases with `github:0froq/og-layer#v0.1.0`.
