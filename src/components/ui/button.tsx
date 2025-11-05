import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../utils/cn'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'ghost'
  size?: 'sm' | 'md'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const base = 'inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
    const variants = {
      default: 'bg-primary text-primary-foreground hover:opacity-90',
      secondary: 'bg-secondary hover:opacity-90',
      ghost: 'hover:bg-muted'
    } as const
    const sizes = { sm: 'h-8 px-3 text-sm', md: 'h-10 px-4' } as const
    return (
      <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props} />
    )
  }
)
Button.displayName = 'Button'


