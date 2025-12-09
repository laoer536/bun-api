import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { signUp, signIn } from '@/lib/auth-client'

// Zod schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Required'),
})

const registerSchema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().email(),
  password: z.string().min(6, 'Min 6 characters'),
})

export function AuthCard() {
  // Forms
  const loginForm = useForm({ resolver: zodResolver(loginSchema) })
  const registerForm = useForm({ resolver: zodResolver(registerSchema) })

  /** Login */
  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    const { email, password } = values
    const { error } = await signIn.email({ email, password })
    if (!error) location.reload()
  }

  /** Register */
  const onRegisterSubmit = async (values: z.infer<typeof registerSchema>) => {
    const { name, email, password } = values
    const { error } = await signUp.email({ name, email, password })
    if (!error) toast.success('Account created!')
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl gap-2">
          <img src="https://elysiajs.com/assets/elysia.svg" alt="elysia" className={'mb-4'} />
          <div>Bun + Elysia + Prisma + React</div>
        </CardTitle>
        <CardDescription>Login or register your account.</CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-4">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          {/* LOGIN TAB */}
          <TabsContent value="login" className="space-y-4">
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input type="email" placeholder="m@example.com" {...loginForm.register('email')} />
                {loginForm.formState.errors.email && (
                  <p className="text-red-500 text-sm">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label>Password</Label>
                <Input type="password" placeholder="••••••••" {...loginForm.register('password')} />
                {loginForm.formState.errors.password && (
                  <p className="text-red-500 text-sm">{loginForm.formState.errors.password.message}</p>
                )}
              </div>
            </form>
          </TabsContent>

          {/* REGISTER TAB */}
          <TabsContent value="register" className="space-y-4">
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
              <div className="grid gap-2">
                <Label>Name</Label>
                <Input type="text" placeholder="Your name" {...registerForm.register('name')} />
                {registerForm.formState.errors.name && (
                  <p className="text-red-500 text-sm">{registerForm.formState.errors.name.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label>Email</Label>
                <Input type="email" placeholder="m@example.com" {...registerForm.register('email')} />
                {registerForm.formState.errors.email && (
                  <p className="text-red-500 text-sm">{registerForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label>Password</Label>
                <Input type="password" placeholder="••••••••" {...registerForm.register('password')} />
                {registerForm.formState.errors.password && (
                  <p className="text-red-500 text-sm">{registerForm.formState.errors.password.message}</p>
                )}
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter>
        <Tabs defaultValue="login" className="w-full">
          <TabsContent value="login">
            <Button className="w-full" onClick={loginForm.handleSubmit(onLoginSubmit)}>
              Sign In
            </Button>
          </TabsContent>

          <TabsContent value="register">
            <Button className="w-full" onClick={registerForm.handleSubmit(onRegisterSubmit)}>
              Register
            </Button>
          </TabsContent>
        </Tabs>
      </CardFooter>
    </Card>
  )
}
