import LoginForm from '@/components/login-form'
import { redirect } from 'next/navigation'
import { getUser } from '../actions'

export default async function LoginPage() {
  const user = await getUser()
  if (user) redirect('/')

  return (
    <main className="flex flex-col p-4">
      <LoginForm />
    </main>
  )
}
