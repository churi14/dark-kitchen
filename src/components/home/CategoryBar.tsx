// components/home/CategoryBar.tsx
// Barra de marcas: Club del Lomito, Burger Club, Milanesa, Brolas, Bebidas, Extras
'use client'
import { cn } from '@/lib/utils'
import { BRANDS } from '@/constants'
import type { BrandSlug } from '@/types'

interface Props {
  active:   BrandSlug
  onChange: (slug: BrandSlug) => void
}

export default function CategoryBar({ active, onChange }: Props) {
  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-hide px-5 pb-4">
      {BRANDS.map(brand => (
        <button
          key={brand.slug}
          onClick={() => onChange(brand.slug)}
          className="flex-shrink-0 flex flex-col items-center gap-1.5 cursor-pointer"
        >
          {/* Icono */}
          <div
            className={cn(
              'w-[56px] h-[56px] rounded-[12px] flex items-center justify-center',
              'text-[26px] border transition-all duration-200',
              active === brand.slug
                ? 'border-accent bg-accent/10 scale-105'
                : 'border-[var(--border)] bg-[var(--surface-2)]'
            )}
          >
            {brand.emoji}
          </div>
          {/* Nombre */}
          <span className={cn(
            'text-[10px] font-semibold text-center max-w-[62px] leading-tight',
            active === brand.slug ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'
          )}>
            {/* Nombre corto para caber en el icono */}
            {brand.slug === 'lomito'   ? 'Club Lomito' :
             brand.slug === 'burger'   ? 'Burger Club' :
             brand.name}
          </span>
        </button>
      ))}
    </div>
  )
}