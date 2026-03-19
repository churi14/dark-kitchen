// app/admin/login/page.tsx
import { Suspense } from 'react'
import LoginContent from './LoginContent'

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#FF6B35] border-t-transparent rounded-full animate-spin" />
      </main>
    }>
      <LoginContent />
    </Suspense>
  )
}