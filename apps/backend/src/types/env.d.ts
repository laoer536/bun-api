declare module 'bun' {
  interface Env {
    readonly DATABASE_URL: string
    readonly JWT_SECRETS: string
    readonly NODEMAILER_AUTH_EMAIL: string
    readonly NODEMAILER_AUTH_PASS: string
    readonly REDIS_HOST: string
    readonly REDIS_PORT: string
    readonly FRONTEND_PROJECT_URL: string
  }
}
