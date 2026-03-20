// components/home/CategoryBar.tsx
'use client'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { BRANDS } from '@/constants'
import type { BrandSlug } from '@/types'

const BRAND_LOGO_MAP: Partial<Record<BrandSlug, string>> = {
  lomito:   '/logo-lomito.svg',
  burger:   '/logo-burger.svg',
  milanesa: '/logo-milanesa.svg',
}

interface Props {
  active:   BrandSlug
  onChange: (slug: BrandSlug) => void
}

export default function CategoryBar({ active, onChange }: Props) {
  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-hide px-5 pb-4">
      {BRANDS.map(brand => {
        const logoSrc = BRAND_LOGO_MAP[brand.slug]
        return (
          <button
            key={brand.slug}
            onClick={() => onChange(brand.slug)}
            className="flex-shrink-0 flex flex-col items-center gap-1.5 cursor-pointer"
          >
            <div
              className={cn(
                'w-[56px] h-[56px] rounded-[12px] flex items-center justify-center',
                'border transition-all duration-200 overflow-hidden',
                active === brand.slug
                  ? 'border-accent bg-accent/10 scale-105'
                  : 'border-[var(--border)] bg-[var(--surface-2)]'
              )}
            >
              {logoSrc ? (
                <Image
                  src={logoSrc}
                  alt={brand.name}
                  width={44}
                  height={44}
                  className="object-contain w-full h-full p-1.5"
                />
              ) : (
                <span className="text-[22px]">{brand.emoji}</span>
              )}
            </div>
            <span className={cn(
              'text-[10px] font-semibold text-center max-w-[62px] leading-tight',
              active === brand.slug ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'
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