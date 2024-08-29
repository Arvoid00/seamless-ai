import OnboardingForm from '@/components/onboarding/OnboardingForm'

function OnboardingPage() {
    return (
        <main className='mx-auto my-auto space-y-4'>
            <h1 className='text-3xl font-bold text-center'>Get started with your onboarding!</h1>
            <OnboardingForm />
        </main>
    )
}

export default OnboardingPage