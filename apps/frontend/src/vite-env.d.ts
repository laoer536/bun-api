/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly NODE_ENV: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_PUBLIC_PATH: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
