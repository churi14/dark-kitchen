'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function LoginContent() {
  const router      = useRouter()
  const params      = useSearchParams()
  const redirect    = params.get('redirect') ?? '/admin/pedidos'
  const supabase    = createClient()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error('Email o contraseña incorrectos')
      setLoading(false)
      return
    }
    router.push(redirect)
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-[360px]">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#FF6B35] rounded-full flex items-center justify-center mx-auto mb-3 text-2xl
                          shadow-[0_4px_20px_rgba(255,107,53,0.4)]">
            🍳
          </div>
          <h1 className="font-display text-[22px] font-extrabold text-white">Dark Kitchen</h1>
          <p className="text-[13px] text-gray-500 mt-1">Panel de administración</p>
        </div>

        <form onSubmit={handleLogin} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[16px] p-6 flex flex-col gap-4">
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@cocina.com" required autoComplete="email"
              className="w-full bg-[#242424] border border-[#2e2e2e] rounded-[10px] px-3.5 py-3
                         text-[14px] text-white placeholder:text-gray-600 outline-none focus:border-[#FF6B35] transition-colors" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required autoComplete="current-password"
              className="w-full bg-[#242424] border border-[#2e2e2e] rounded-[10px] px-3.5 py-3
                         text-[14px] text-white placeholder:text-gray-600 outline-none focus:border-[#FF6B35] transition-colors" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full h-11 bg-[#FF6B35] rounded-[10px] text-white font-bold text-[14px] mt-1
                       shadow-[0_4px_16px_rgba(255,107,53,0.3)] disabled:opacity-50
                       flex items-center justify-center gap-2">
            {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <p className="text-center text-[12px] text-gray-600 mt-4">Solo personal autorizado</p>
      </div>
    </main>
  )
}