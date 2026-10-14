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

### Private repository (CI / Workers Builds)

[giget](https://github.com/unjs/giget) clones the layer during `nuxt prepare` / `nuxt generate`. Set **`GIGET_AUTH`** to a GitHub token with **Contents: Read** on `0froq/og-layer` (fine-grained or classic `repo` scope). giget sends it as `Authorization: Bearer …`.

For `pnpm install` of a `github:0froq/og-layer#…` dependency, configure git HTTPS auth separately (for example `GITHUB_TOKEN` in CI with `git config` credential helper).

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

## Content pages

Auto-imported helpers from this layer:

- `contentOgOverride`, `explicitContentCover`, `paperFields`, `ogComponentName`, `ogExtraProps`
- `countCardWords` — import `@froq/og-covers-layer/card-words` in `nuxt.config` hooks

## Fonts

The layer registers Instrument Serif (title), Noto Serif SC (Han), Geist Mono (meta), and EB Garamond italic 400 (watermark). The OFL notice for EB Garamond ships in `public/fonts/EB-Garamond-OFL.txt`.

This repo is the standalone layer (`@froq/og-covers-layer`). Tag releases (for example `v0.1.0`) and pin `extends` to `github:0froq/og-layer#v0.1.0`.
