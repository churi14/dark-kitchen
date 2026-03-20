// components/home/StoreHeader.tsx
import Image from 'next/image'

const BRAND_LOGOS = [
  { src: '/logo-lomito.svg',   alt: 'Club del Lomito',  slug: 'lomito' },
  { src: '/logo-burger.svg',   alt: 'La Burger Club',   slug: 'burger' },
  { src: '/logo-milanesa.svg', alt: 'Milanesa',         slug: 'milanesa' },
]

export default function StoreHeader() {
  return (
    <div className="flex flex-col items-center pt-4 pb-0 px-5">
      <Image
        src="/logo.svg"
        alt="La Cocina Ushuaia"
        width={280}
        height={88}
        className="object-contain"
        priority
      />
      <div className="flex items-center justify-center gap-5 mt-2">
        {BRAND_LOGOS.map(brand => (
          <div key={brand.slug} className="w-[70px] h-[70px] flex items-center justify-center">
            <Image
              src={brand.src}
              alt={brand.alt}
              width={70}
              height={70}
              className="object-contain w-full h-full"
            />
          </div>
        ))}
      </div>
    </div>
  )
}