// components/home/CategoryBar.tsx
'use client'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { BRANDS } from '@/constants'
import type { BrandSlug } from '@/types'

const BRAND_CONFIG: Partial<Record<BrandSlug, { logo: string }>> = {
  lomito:   { logo: '/logo-lomito.svg'   },
  burger:   { logo: '/logo-burger.svg'   },
  milanesa: { logo: '/logo-milanesa.svg' },
}

interface Props {
  active:   BrandSlug
  onChange: (slug: BrandSlug) => void
}

export default function CategoryBar({ active, onChange }: Props) {
  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-hide px-5 pb-3">
      {BRANDS.map(brand => {
        const config  = BRAND_CONFIG[brand.slug]
        const isActive = active === brand.slug

        return (
          <button
            key={brand.slug}
            onClick={() => onChange(brand.slug)}
            className="flex-shrink-0 flex flex-col items-center gap-1 cursor-pointer"
          >
            {/* Ícono */}
            <div
              className={cn(
                'w-[72px] h-[72px] rounded-[16px] flex items-center justify-center transition-all duration-200',
                isActive ? 'border-2 border-accent' : 'border-2 border-transparent'
              )}
              style={{ backgroundColor: config ? '#ffffff' : 'var(--surface-2)' }}
            >
              {config ? (
                <Image
                  src={config.logo}
                  alt={brand.name}
                  width={60}
                  height={60}
                  className="object-contain p-1.5"
                />
              ) : (
                <span className="text-[26px]">{brand.emoji}</span>
              )}
            </div>

            {/* Label */}
            <span className={cn(
              'text-[10px] font-semibold text-center max-w-[72px] leading-tight',
              isActive ? 'text-accent' : 'text-[var(--text-muted)]'
            )}>
              {brand.slug === 'lomito' ? 'Club Lomito' :
               brand.slug === 'burger' ? 'Burger Club' :
               brand.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}