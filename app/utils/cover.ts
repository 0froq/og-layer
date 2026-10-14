// Share-image overrides for a Nuxt Content page.
// Order: frontmatter `cover`, `ogImage.url`, a file in `public/covers/`.
// Anything else is drawn by defineOgImage.

export interface ContentCoverSource {
  /** Nuxt Content collection name: `pages`, `notes`, `changelog`, `docs`, or a derived site's own. */
  collection: string
  /** Collection path, e.g. `/en/notes/note`. */
  path: string
  /** Optional frontmatter `cover`: a `public/` path or an absolute https URL. */
  cover?: string | null
}

export interface PaperSource {
  title?: string | null
  evergreen?: boolean | null
  kind?: string | null
  created?: string | null
  date?: string | null
  updated?: string | null
  last_modified?: string | null
  words?: number | null
}

export interface PaperFields {
  title: string
  evergreen: boolean
  created: string
  updated: string
  words: number
}

const ABSOLUTE_HTTPS = /^https:\/\//i

function isFilled(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

/** Locale folder from a content path (`/zh/docs/install` → `zh`). */
export function contentCoverLocale(contentPath: string): string {
  return splitContentPath(contentPath)[0] ?? ''
}

/**
 * File slug under `public/covers/<collection>/<locale>/`.
 * Drops the locale folder and, when present, the collection folder.
 * Collection roots (`/en`, `/en/docs`) become `index`.
 */
export function contentCoverSlug(collection: string, contentPath: string): string {
  const rest = splitContentPath(contentPath).slice(1)
  const after = rest[0] === collection ? rest.slice(1) : rest
  return after.join('/') || 'index'
}

export function defaultContentCoverPath(collection: string, locale: string, slug: string): string {
  return `/covers/${collection}/${locale}/${slug}.png`
}

/**
 * Frontmatter `cover` when it is https or an existing public file,
 * else `public/covers/<collection>/<locale>/<slug>.png` when that file exists.
 * Undefined means the page should call defineOgImage.
 */
export function explicitContentCover(
  source: ContentCoverSource | undefined,
  hasPublicFile: (urlPath: string) => boolean,
): string | undefined {
  if (!source)
    return undefined

  if (isFilled(source.cover)) {
    if (ABSOLUTE_HTTPS.test(source.cover))
      return source.cover.trim()
    const custom = publicUrlPath(source.cover)
    if (custom && hasPublicFile(custom))
      return custom
  }

  const locale = contentCoverLocale(source.path)
  const slug = contentCoverSlug(source.collection, source.path)
  if (locale && slug) {
    const dropped = defaultContentCoverPath(source.collection, locale, slug)
    if (hasPublicFile(dropped))
      return dropped
  }

  return undefined
}

export function contentCoverSource(
  collection: string,
  page: { path: string, cover?: string | null } | null | undefined,
): ContentCoverSource | undefined {
  if (!page)
    return undefined
  return { collection, path: page.path, cover: page.cover }
}

export function paperFields(page: PaperSource | null | undefined): PaperFields {
  return {
    title: page?.title?.trim() || '',
    evergreen: page?.evergreen === true || page?.kind === 'evergreen',
    created: filled(page?.created) || filled(page?.date) || '',
    updated: filled(page?.last_modified) || filled(page?.updated) || '',
    words: typeof page?.words === 'number' && page.words > 0 ? page.words : 0,
  }
}

export function hasShareFile(files: unknown, urlPath: string): boolean {
  return Array.isArray(files) && files.includes(urlPath)
}

export interface OgImageFrontmatter {
  url?: string
  component?: string
  props?: Record<string, unknown>
}

/**
 * `false` turns the image off. A string is a manual cover.
 * `undefined` means the page should call defineOgImage.
 * Frontmatter `cover` wins over `ogImage.url`.
 */
export function contentOgOverride(
  page: { path: string, cover?: string | null, ogImage?: boolean | OgImageFrontmatter | null } | null | undefined,
  collection: string,
  files: unknown,
): string | false | undefined {
  if (!page)
    return undefined
  if (page.ogImage === false)
    return false
  const ogUrl = page.ogImage && page.ogImage !== true ? page.ogImage.url : undefined
  return explicitContentCover({
    collection,
    path: page.path,
    cover: isFilled(page.cover) ? page.cover : ogUrl,
  }, path => hasShareFile(files, path))
}

export function ogComponentName(page: { ogImage?: boolean | OgImageFrontmatter | null } | null | undefined): 'Paper' {
  const og = page?.ogImage
  const name = og && og !== true ? og.component?.trim() : undefined
  if (!name || name === 'Paper')
    return 'Paper'
  return name as 'Paper'
}

export function ogExtraProps(page: { ogImage?: boolean | OgImageFrontmatter | null } | null | undefined): Record<string, unknown> {
  const og = page?.ogImage
  if (!og || og === true || !og.props)
    return {}
  return og.props
}

function filled(value: string | null | undefined): string {
  return value?.trim() || ''
}

function splitContentPath(contentPath: string): string[] {
  return contentPath.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean)
}

function publicUrlPath(value: string): string | undefined {
  const trimmed = value.trim()
  if (!trimmed)
    return undefined
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  if (path.includes('\0') || path.split('/').includes('..'))
    return undefined
  return path
}
