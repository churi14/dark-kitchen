// components/home/StoreHeader.tsx
// Logo, nombre del negocio y tagline de marcas
import Image from 'next/image'

export default function StoreHeader() {
  return (
    <div className="flex flex-col items-center pt-5 pb-2 px-5">
      {/* Logo circular con el SVG real */}
      <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center
                      shadow-[0_6px_20px_rgba(255,107,53,0.35)] mb-3 overflow-hidden p-3">
        <Image
          src="/logo.svg"
          alt="La Cocina Ushuaia"
          width={56}
          height={56}
          className="w-full h-full object-contain"
          priority
        />
      </div>

      <h1 className="font-display text-xl font-extrabold text-[var(--text)] tracking-tight">
        La Cocina Ushuaia
      </h1>
      <p className="text-xs text-[var(--text-muted)] mt-0.5">
        Club del Lomito · La Burger Club · Milanesa
      </p>
    </div>
  )
}