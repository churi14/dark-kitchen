// app/confirmacion/page.tsx
import { Suspense } from 'react'
import ConfirmacionContent from './ConfirmacionContent'

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </main>
    }>
      <ConfirmacionContent />
    </Suspense>
  )
}