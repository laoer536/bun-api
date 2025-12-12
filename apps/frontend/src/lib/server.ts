import { treaty } from '@elysiajs/eden'
import type { App } from 'backend'
import { toast } from 'sonner'

const server = treaty<App>(import.meta.env.VITE_API_BASE_URL, {
  // headers: [() => ({ authorization: `Bearer ${localStorage.getItem('token')}` })],
  headers: [], // better-auth auto use cookie for auth
  onResponse: async (res) => {
    if (!res.ok) {
      const text = await res.text()
      const status = res.status.toString()
      toast.error(status, {
        description: text,
        position: 'top-center',
      })
    }
  },
})
export { server }
