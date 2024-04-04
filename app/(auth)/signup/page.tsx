import SignupForm from '@/components/signup-form'
import { redirect } from 'next/navigation'
import { getUser } from '../actions'

export default async function SignupPage() {
    const user = await getUser()

    if (user) redirect('/')

    return (
        <main className="flex flex-col p-4">
            <SignupForm />
        </main>
    )
}
