import { EmailLogin } from '@components/molecules/EmailLogin'
import { User } from '@prisma/client'

import server from '@/lib/server'

function App() {
  const [users, setUsers] = useState<User[]>([])
  useEffect(() => {
    if (localStorage.getItem('token')) {
      server.user.get().then((res) => {
        if (res.error) {
          localStorage.removeItem('token')
          return location.reload()
        }
        setUsers(res.data)
      })
    }
  }, [])

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="flex flex-col gap-2">
        {users.map((user) => (
          <div key={user.id}>
            {user.name}----{user.email}
          </div>
        ))}
      </div>
      {!localStorage.getItem('token') && <EmailLogin />}
    </div>
  )
}

export default App
