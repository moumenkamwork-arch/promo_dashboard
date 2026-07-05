import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type Tone = 'neutral' | 'ok' | 'warn' | 'danger' | 'info' | 'accent';

const tones: Record<Tone, string> = {
  neutral: 'bg-surface-3 text-ink-muted',
  ok: 'bg-ok-soft text-ok',
  warn: 'bg-warn-soft text-warn',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
  accent: 'bg-accent-soft text-accent',
};

export function Badge({
  tone = 'neutral',
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide whitespace-nowrap',
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
