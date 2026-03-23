// components/home/CategoryBar.tsx
'use client'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { BRANDS } from '@/constants'
import type { BrandSlug } from '@/types'

// Colores de fondo propios de cada marca para que el logo blanco se vea
const BRAND_CONFIG: Partial<Record<BrandSlug, { logo: string; bg: string }>> = {
  lomito:   { logo: '/logo-lomito.svg',   bg: '#1a1a1a' },
  burger:   { logo: '/logo-burger.svg',   bg: '#1a1a1a' },
  milanesa: { logo: '/logo-milanesa.svg', bg: '#1a1a1a' },
}

interface Props {
  active:   BrandSlug
  onChange: (slug: BrandSlug) => void
}

export default function CategoryBar({ active, onChange }: Props) {
  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-hide px-5 pb-4">
      {BRANDS.map(brand => {
        const config = BRAND_CONFIG[brand.slug]
        const isActive = active === brand.slug

        return (
          <button
            key={brand.slug}
            onClick={() => onChange(brand.slug)}
            className="flex-shrink-0 flex flex-col items-center gap-1.5 cursor-pointer"
          >
            <div
              className={cn(
                'w-[60px] h-[60px] rounded-[14px] flex items-center justify-center transition-all duration-200',
                isActive
                  ? 'border-2 border-accent'
                  : 'border-2 border-transparent'
              )}
              style={config ? { backgroundColor: config.bg } : { backgroundColor: 'var(--surface-2)' }}
            >
              {config ? (
                <Image
                  src={config.logo}
                  alt={brand.name}
                  width={48}
                  height={48}
                  className="object-contain p-2"
                />
              ) : (
                <span className="text-[24px]">{brand.emoji}</span>
              )}
            </div>

            <span className={cn(
              'text-[10px] font-semibold text-center max-w-[64px] leading-tight',
              isActive ? 'text-accent font-bold' : 'text-[var(--text-muted)]'
            )}>
              {brand.slug === 'lomito'   ? 'Club Lomito' :
               brand.slug === 'burger'   ? 'Burger Club' :
               brand.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}