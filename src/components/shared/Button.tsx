// components/shared/Button.tsx
import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?:    'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-sans font-semibold rounded-[10px] transition-all duration-150 active:scale-[.97] disabled:opacity-40 disabled:cursor-not-allowed'

  const variants = {
    primary:   'bg-accent text-white shadow-[0_4px_16px_rgba(255,107,53,0.3)] hover:bg-accent-hover',
    secondary: 'bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--accent)]',
    ghost:     'bg-transparent text-[var(--text-muted)] hover:text-[var(--text)]',
    danger:    'bg-red-500/15 text-red-400 hover:bg-red-500/25',
  }

  const sizes = {
    sm: 'h-8  px-3  text-sm',
    md: 'h-11 px-4  text-sm',
    lg: 'h-12 px-6  text-base',
  }

  return (
    <button
      className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : null}
      {children}
    </button>
  )
}
