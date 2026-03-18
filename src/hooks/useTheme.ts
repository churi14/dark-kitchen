// ─────────────────────────────────────────────────────────
// hooks/useTheme.ts — Toggle dark/light mode
// ─────────────────────────────────────────────────────────
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeStore {
  theme: 'dark' | 'light'
  toggle: () => void
  setTheme: (t: 'dark' | 'light') => void
}

export const useTheme = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'dark',

      toggle: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark'
        set({ theme: next })
        document.documentElement.classList.toggle('dark', next === 'dark')
      },

      setTheme: (t) => {
        set({ theme: t })
        document.documentElement.classList.toggle('dark', t === 'dark')
      },
    }),
    { name: 'dk-theme' }
  )
)
