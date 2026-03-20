// components/home/StoreHeader.tsx
import Image from 'next/image'

const BRAND_LOGOS = [
  { src: '/logo-lomito.svg',   alt: 'Club del Lomito',  slug: 'lomito' },
  { src: '/logo-burger.svg',   alt: 'La Burger Club',   slug: 'burger' },
  { src: '/logo-milanesa.svg', alt: 'Milanesa',         slug: 'milanesa' },
]

export default function StoreHeader() {
  return (
    <div className="flex flex-col items-center pt-4 pb-2 px-5">
      {/* Logo principal */}
      <Image
        src="/logo.svg"
        alt="La Cocina Ushuaia"
        width={300}
        height={120}
        className="object-contain"
        priority
      />

      {/* Logos de las 3 marcas */}
      <div className="flex items-center justify-center gap-6 mt-3 mb-1">
        {BRAND_LOGOS.map(brand => (
          <div key={brand.slug} className="w-16 h-16 flex items-center justify-center">
            <Image
              src={brand.src}
              alt={brand.alt}
              width={64}
              height={64}
              className="object-contain w-full h-full"
            />
          </div>
        ))}
      </div>
    </div>
  )
}