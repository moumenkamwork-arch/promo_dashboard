import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'icon';

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-black hover:bg-accent-press font-semibold',
  secondary: 'bg-surface-3 text-ink hover:bg-surface-4 border border-line',
  outline: 'border border-line-strong text-ink hover:bg-surface-2',
  ghost: 'text-ink-muted hover:text-ink hover:bg-surface-2',
  danger: 'bg-danger text-black hover:opacity-90 font-semibold',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  icon: 'h-9 w-9',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-full whitespace-nowrap',
        'transition-[background-color,color,transform,opacity] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
        'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 select-none',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
