// components/admin/LogoutButton.tsx
'use client'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router   = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="text-[12px] text-gray-500 hover:text-red-400 transition-colors px-3 py-2 w-full text-left"
    >
      Cerrar sesión
    </button>
  )
}