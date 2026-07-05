import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MagnifyingGlass, ArrowElbowDownLeft } from '@phosphor-icons/react';
import { allNavItems } from '@/components/layout/nav';
import { cn } from '@/lib/utils';

export function CommandBar({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const items = allNavItems.map((item) => ({ ...item, label: t(`nav.${item.key}`) }));
    if (!q) return items;
    return items.filter((i) => i.label.toLowerCase().includes(q) || i.key.includes(q));
  }, [query, t]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
    }
  }, [open]);
  useEffect(() => setActive(0), [query]);

  const go = (path: string) => {
    navigate(path);
    onOpenChange(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault();
      go(results[active].path);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-1/2 top-[18%] z-50 w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border border-line bg-surface-1 shadow-2xl data-[state=open]:animate-fade-up"
          onKeyDown={onKeyDown}
        >
          <Dialog.Title className="sr-only">{t('common.search')}</Dialog.Title>
          <div className="flex items-center gap-3 border-b border-line px-4">
            <MagnifyingGlass size={18} className="text-ink-faint" />
            {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('common.searchEverything')}
              className="h-12 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
            />
          </div>
          <ul className="max-h-80 overflow-y-auto p-2">
            {results.map((item, i) => {
              const Icon = item.icon;
              return (
                <li key={item.key}>
                  <button
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(item.path)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors',
                      i === active ? 'bg-surface-3 text-ink' : 'text-ink-muted',
                    )}
                  >
                    <Icon size={18} className={i === active ? 'text-accent' : ''} />
                    <span className="flex-1 text-start">{item.label}</span>
                    {i === active ? <ArrowElbowDownLeft size={14} className="text-ink-faint" /> : null}
                  </button>
                </li>
              );
            })}
            {!results.length ? (
              <li className="px-3 py-6 text-center text-sm text-ink-faint">{t('common.noResults')}</li>
            ) : null}
          </ul>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
