import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-line bg-surface-1 px-6 py-16 text-center',
        className,
      )}
    >
      {icon ? (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-3 text-ink-muted">
          {icon}
        </div>
      ) : null}
      <p className="font-brand text-base text-ink">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ message, onRetry, retryLabel }: { message: string; onRetry?: () => void; retryLabel: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-danger-soft bg-danger-soft px-6 py-12 text-center">
      <p className="text-sm font-medium text-danger">{message}</p>
      {onRetry ? (
        <button
          onClick={onRetry}
          className="mt-4 rounded-full border border-danger px-4 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger hover:text-black"
        >
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}
