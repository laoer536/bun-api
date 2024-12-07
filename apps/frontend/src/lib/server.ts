import { treaty } from '@elysiajs/eden'
import type { App } from 'bun-api'
const server = treaty<App>(import.meta.env.VITE_API_BASE_URL, {
  headers: [() => ({ authorization: `Bearer ${localStorage.getItem('token')}` })],
})
export default server
