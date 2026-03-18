// components/home/SchedulePicker.tsx
// Selector de horario: lo antes posible o programar
'use client'
import { useState } from 'react'
import { BUSINESS_HOURS } from '@/constants'
import { cn } from '@/lib/utils'

interface Props {
  onChange: (value: string | null) => void // null = lo antes posible
}

export default function SchedulePicker({ onChange }: Props) {
  const [mode, setMode] = useState<'now' | 'later'>('now')

  function handleModeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value as 'now' | 'later'
    setMode(v)
    if (v === 'now') onChange(null)
  }

  return (
    <div className="bg-[var(--surface-2)] rounded-[12px] border border-[var(--border)] overflow-hidden">
      {/* Fila principal */}
      <div className="flex items-center justify-between px-3.5 py-3">
        <select
          value={mode}
          onChange={handleModeChange}
          className={cn(
            'appearance-none border border-accent rounded-[8px]',
            'px-2.5 py-1.5 pr-6 text-[12px] font-semibold text-[var(--text)]',
            'bg-[var(--surface)] cursor-pointer outline-none',
            // flecha naranja custom
            'bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'6\'%3E%3Cpath d=\'M0 0l5 6 5-6z\' fill=\'%23FF6B35\'/%3E%3C/svg%3E")]',
            'bg-no-repeat bg-[right_8px_center]'
          )}
        >
          <option value="now">Lo antes posible</option>
          <option value="later">Programar pedido</option>
        </select>

        {/* Horarios disponibles */}
        <div className="flex flex-col items-end gap-1">
          <span className="bg-green-500/15 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
            Disponible
          </span>
          {BUSINESS_HOURS.map(h => (
            <span key={h.label} className="text-[11px] text-[var(--text-muted)]">
              🕐 {h.label}
            </span>
          ))}
        </div>
      </div>

      {/* Selectores de día/hora (solo cuando elige programar) */}
      {mode === 'later' && (
        <div className="flex gap-2 px-3.5 pb-3">
          <select
            onChange={e => onChange(e.target.value || null)}
            className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-[8px] px-2.5 py-2 text-[13px] text-[var(--text)] outline-none cursor-pointer"
          >
            <option value="">Elegir día</option>
            <option value="hoy">Hoy</option>
            <option value="manana">Mañana</option>
            <option value="pasado">Pasado mañana</option>
          </select>
          <select
            className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-[8px] px-2.5 py-2 text-[13px] text-[var(--text)] outline-none cursor-pointer"
          >
            <option value="">Elegir hora</option>
            {['12:00','12:30','13:00','13:30','14:00','14:30',
              '20:00','20:30','21:00','21:30','22:00','22:30','23:00','23:30']
              .map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
      )}
    </div>
  )
}
