import * as RAvatar from '@radix-ui/react-avatar';
import { initials } from '@/lib/format';
import { cn } from '@/lib/utils';

export function Avatar({
  src,
  name,
  size = 36,
  className,
}: {
  src?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
}) {
  return (
    <RAvatar.Root
      className={cn('inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-surface-3', className)}
      style={{ width: size, height: size }}
    >
      {src ? <RAvatar.Image src={src} alt={name ?? ''} className="h-full w-full object-cover" /> : null}
      <RAvatar.Fallback
        className="flex h-full w-full items-center justify-center font-brand text-ink-muted"
        style={{ fontSize: size * 0.38 }}
      >
        {initials(name)}
      </RAvatar.Fallback>
    </RAvatar.Root>
  );
}
