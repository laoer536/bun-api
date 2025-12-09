import { useQuery } from '@tanstack/react-query'

import { Loading } from '@/components/molecules/Loading'
import { server } from '@/lib/server'
import { useSession } from '@/lib/auth-client.ts'
import { AuthCard } from '@/components/molecules/AuthCard.tsx'

function App() {
  const { data: user } = useSession()
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => server.users.get(),
    enabled: !!user,
  })
  return (
    <div className="h-screen flex items-center justify-center">
      {user ? (
        <div className="flex flex-col gap-2">
          {users?.data?.map((user) => (
            <div key={user.id}>
              {user.name}----{user.email}
            </div>
          ))}
        </div>
      ) : (
        <AuthCard />
      )}
    </div>
  )
}

export default App
