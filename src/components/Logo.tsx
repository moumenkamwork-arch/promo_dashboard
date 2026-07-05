import { cn } from '@/lib/utils';

export function Logo({ wordmark = true, size = 30, className }: { wordmark?: boolean; size?: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <img src="/logo.svg" alt="Promoo" width={size} height={size} className="shrink-0" draggable={false} />
      {wordmark ? (
        <span className="font-brand text-[1.35rem] leading-none tracking-tight text-ink">
          Promoo
        </span>
      ) : null}
    </span>
  );
}
