import * as RTabs from '@radix-ui/react-tabs';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Tabs({
  value,
  onValueChange,
  tabs,
  children,
}: {
  value: string;
  onValueChange: (v: string) => void;
  tabs: { value: string; label: string; count?: number }[];
  children: ReactNode;
}) {
  return (
    <RTabs.Root value={value} onValueChange={onValueChange}>
      <RTabs.List className="flex items-center gap-1 border-b border-line">
        {tabs.map((tab) => (
          <RTabs.Trigger
            key={tab.value}
            value={tab.value}
            className={cn(
              'relative -mb-px inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-ink-muted transition-colors',
              'hover:text-ink data-[state=active]:text-ink',
              'after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:rounded-full after:bg-transparent',
              'data-[state=active]:after:bg-accent',
            )}
          >
            {tab.label}
            {typeof tab.count === 'number' ? (
              <span className="rounded-full bg-surface-3 px-1.5 py-0.5 text-[10px] text-ink-muted">{tab.count}</span>
            ) : null}
          </RTabs.Trigger>
        ))}
      </RTabs.List>
      {children}
    </RTabs.Root>
  );
}

export const TabPanel = RTabs.Content;
