import * as RSelect from '@radix-ui/react-select';
import { CaretDown, Check } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

export interface Option {
  value: string;
  label: string;
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder,
  className,
  size = 'md',
}: {
  value: string;
  onValueChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md';
}) {
  return (
    <RSelect.Root value={value} onValueChange={onValueChange}>
      <RSelect.Trigger
        className={cn(
          'inline-flex items-center justify-between gap-2 rounded-md border border-line bg-surface-2 text-ink',
          'transition-colors hover:border-line-strong focus:outline-none focus:ring-1 focus:ring-accent',
          size === 'sm' ? 'h-8 px-2.5 text-xs' : 'h-10 px-3 text-sm',
          className,
        )}
      >
        <RSelect.Value placeholder={placeholder} />
        <RSelect.Icon>
          <CaretDown size={14} className="text-ink-faint" />
        </RSelect.Icon>
      </RSelect.Trigger>
      <RSelect.Portal>
        <RSelect.Content
          position="popper"
          sideOffset={6}
          className="z-50 overflow-hidden rounded-md border border-line bg-surface-2 shadow-2xl data-[state=open]:animate-fade-up"
        >
          <RSelect.Viewport className="p-1">
            {options.map((opt) => (
              <RSelect.Item
                key={opt.value}
                value={opt.value}
                className={cn(
                  'relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pe-8 ps-3 text-sm text-ink-muted',
                  'data-[highlighted]:bg-surface-3 data-[highlighted]:text-ink data-[highlighted]:outline-none',
                  'data-[state=checked]:text-ink',
                )}
              >
                <RSelect.ItemText>{opt.label}</RSelect.ItemText>
                <RSelect.ItemIndicator className="absolute end-2 inline-flex items-center">
                  <Check size={14} className="text-accent" weight="bold" />
                </RSelect.ItemIndicator>
              </RSelect.Item>
            ))}
          </RSelect.Viewport>
        </RSelect.Content>
      </RSelect.Portal>
    </RSelect.Root>
  );
}
