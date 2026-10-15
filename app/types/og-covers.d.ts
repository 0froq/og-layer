declare module 'nuxt/schema' {
  interface AppConfigInput {
    ogCovers?: {
      mark?: string
      colors?: {
        title?: string
        description?: string
        paper?: string
        border?: string
        mark?: string
        meta?: string
        evergreen?: string
      }
    }
  }
}

export {}
