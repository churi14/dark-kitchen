// components/home/SearchBar.tsx
'use client'
interface Props {
  value:    string
  onChange: (v: string) => void
}

export default function SearchBar({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2.5 bg-[var(--surface-2)] rounded-[10px] px-3.5 py-2.5 border border-[var(--border)]">
      <svg width="14" height="14" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Buscar productos..."
        className="flex-1 bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none"
      />
      {value && (
        <button onClick={() => onChange('')} className="text-[var(--text-muted)] text-sm leading-none">✕</button>
      )}
    </div>
  )
}
