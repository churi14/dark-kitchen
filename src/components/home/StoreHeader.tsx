// components/home/StoreHeader.tsx
// Logo, nombre del negocio y tagline de marcas
import Image from 'next/image'

export default function StoreHeader() {
  return (
    <div className="flex flex-col items-center pt-5 pb-2 px-5">
      {/* Logo circular — reemplazar src con el logo real desde Supabase Storage */}
      <div className="w-18 h-18 rounded-full bg-accent flex items-center justify-center
                      shadow-[0_6px_20px_rgba(255,107,53,0.35)] mb-3">
        <span className="text-3xl">🍔</span>
      </div>

      <h1 className="font-display text-xl font-extrabold text-[var(--text)] tracking-tight">
        Dark Kitchen
      </h1>
      <p className="text-xs text-[var(--text-muted)] mt-0.5">
        Club del Lomito · La Burger Club · Milanesa · Brolas
      </p>
    </div>
  )
}
