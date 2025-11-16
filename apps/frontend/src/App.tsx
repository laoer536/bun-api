import { useQuery } from '@tanstack/react-query'

import { EmailLogin } from '@/components/molecules/EmailLogin'
import { Loading } from '@/components/molecules/Loading'
import { server } from '@/lib/server'
import { getTypedServer } from '@/lib/utils.ts'
import { UserModelType } from 'bun-api'

function App() {
  const { data, isSuccess } = useQuery({
    queryKey: ['users'],
    queryFn: () => getTypedServer<UserModelType['users']>(server.user.get),
  })
  if (!isSuccess) {
    return <Loading />
  }
  return (
    <div className="h-screen flex items-center justify-center">
      {data.error ? (
        <EmailLogin />
      ) : (
        <div className="flex flex-col gap-2">
          {data.data.map((user) => (
            <div key={user.id}>
              {user.name}----{user.email}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App
