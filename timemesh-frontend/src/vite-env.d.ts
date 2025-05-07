/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_URL: string
  readonly VITE_TOKEN_KEY: string
  readonly VITE_REFRESH_TOKEN_KEY: string
  readonly VITE_PRIMARY_COLOR: string
  readonly VITE_SECONDARY_COLOR: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
