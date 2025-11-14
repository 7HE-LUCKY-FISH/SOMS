import { SignupForm } from '@/components/auth/signup-form'
import Link from 'next/link'
import { Shield } from 'lucide-react'

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-secondary/20 to-background p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="size-10 rounded-xl bg-primary flex items-center justify-center">
              <Shield className="size-6 text-primary-foreground" />
            </div>
            <span className="font-semibold text-2xl text-foreground">SOMS</span>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Create your account</h1>
          <p className="text-muted-foreground">Choose your role and get started with SOMS</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
          <SignupForm />
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary hover:underline font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
