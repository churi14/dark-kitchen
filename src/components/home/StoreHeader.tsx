// components/home/StoreHeader.tsx
import Image from 'next/image'

export default function StoreHeader() {
  return (
    <div className="flex flex-col items-center pt-6 pb-2 px-5">
      {/* Logo directo sin círculo */}
      <Image
        src="/logo.svg"
        alt="La Cocina Ushuaia"
        width={300}
        height={120}
        className="object-contain mb-2"
        priority
      />
      <p className="text-xs text-[var(--text-muted)]">
        Club del Lomito · La Burger Club · Milanesa
      </p>
    </div>
  )
}