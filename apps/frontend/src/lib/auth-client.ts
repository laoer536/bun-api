import { createAuthClient } from 'better-auth/react'
const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/auth/api/auth`,
})

export const { signIn, signUp, useSession } = authClient
