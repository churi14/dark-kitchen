// app/confirmacion/page.tsx — Pantalla post-pedido
'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { formatOrderNumber } from '@/lib/utils'
import { WHATSAPP_NUMBER }   from '@/constants'

export default function ConfirmacionPage() {
  const router      = useRouter()
  const params      = useSearchParams()
  const orderId     = params.get('order')
  const orderNumber = params.get('number')
  const status      = params.get('status') // 'success' | 'pending' | null

  const isPending = status === 'pending'

  // Número de WhatsApp para consultas
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hola! Hice el pedido ${formatOrderNumber(Number(orderNumber))} y quiero consultarlo.`
  )}`

  return (
    <main className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-[380px] w-full">

        {/* Icono de estado */}
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl
          ${isPending
            ? 'bg-amber-500/15'
            : 'bg-green-500/15'
          }`}>
          {isPending ? '⏳' : '✅'}
        </div>

        {/* Título */}
        <h1 className="font-display text-[24px] font-extrabold text-[var(--text)] mb-2">
          {isPending ? '¡Pedido recibido!' : '¡Pedido confirmado!'}
        </h1>

        {orderNumber && (
          <p className="text-[var(--text-muted)] text-sm mb-1">
            Tu número de pedido es
          </p>
        )}
        {orderNumber && (
          <p className="font-display text-[32px] font-extrabold text-accent mb-4">
            {formatOrderNumber(Number(orderNumber))}
          </p>
        )}

        {/* Mensaje según estado de pago */}
        <div className="bg-[var(--surface-2)] rounded-[14px] border border-[var(--border)] p-4 mb-6 text-left">
          {isPending ? (
            <>
              <p className="text-sm text-[var(--text)] font-semibold mb-1">Pago en proceso</p>
              <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">
                Tu pago está siendo procesado. Te avisaremos por WhatsApp cuando se confirme y tu pedido pase a cocina.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-[var(--text)] font-semibold mb-1">¿Qué pasa ahora?</p>
              <ul className="text-[13px] text-[var(--text-muted)] space-y-1.5 leading-relaxed">
                <li>🍳 Tu pedido ya está en cocina</li>
                <li>📲 Te avisamos por WhatsApp cuando esté listo</li>
                <li>🛵 Si elegiste delivery, te cotizamos el envío por WhatsApp</li>
              </ul>
            </>
          )}
        </div>

        {/* Botones */}
        <div className="flex flex-col gap-3">
          <a href={waLink} target="_blank" rel="noopener noreferrer"
            className="w-full h-12 bg-[#25D366] rounded-[12px] text-white font-bold text-[14px]
                       flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(37,211,102,0.3)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Consultar por WhatsApp
          </a>

          <button onClick={() => router.push('/')}
            className="w-full h-11 bg-transparent border border-[var(--border)] rounded-[12px]
                       text-[var(--text-muted)] font-semibold text-[13px]">
            Volver al menú
          </button>
        </div>

      </div>
    </main>
  )
}
