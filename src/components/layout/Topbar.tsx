import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useTranslation } from 'react-i18next';
import { List, MagnifyingGlass, SignOut, Translate, SidebarSimple } from '@phosphor-icons/react';
import { useAuth } from '@/auth/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';

export function Topbar({
  onMenuClick,
  onCollapseClick,
  onOpenCommand,
}: {
  onMenuClick: () => void;
  onCollapseClick: () => void;
  onOpenCommand: () => void;
}) {
  const { t, i18n } = useTranslation();
  const { profile, logout } = useAuth();

  const toggleLang = () => void i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');
  const mod = navigator.platform.toLowerCase().includes('mac') ? '⌘' : 'Ctrl';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-base/80 px-4 backdrop-blur-md">
      <button
        onClick={onMenuClick}
        className="rounded-md p-2 text-ink-muted hover:bg-surface-2 hover:text-ink lg:hidden"
        aria-label="Menu"
      >
        <List size={20} />
      </button>
      <button
        onClick={onCollapseClick}
        className="hidden rounded-md p-2 text-ink-muted hover:bg-surface-2 hover:text-ink lg:block"
        aria-label="Collapse sidebar"
      >
        <SidebarSimple size={20} />
      </button>

      <button
        onClick={onOpenCommand}
        className={cn(
          'group flex h-9 max-w-md flex-1 items-center gap-2 rounded-full border border-line bg-surface-2 px-3.5 text-sm text-ink-faint',
          'transition-colors hover:border-line-strong',
        )}
      >
        <MagnifyingGlass size={16} />
        <span className="flex-1 text-start">{t('common.searchEverything')}</span>
        <kbd className="hidden items-center gap-0.5 rounded border border-line bg-surface-3 px-1.5 py-0.5 font-mono text-[10px] text-ink-muted sm:inline-flex">
          {mod} K
        </kbd>
      </button>

      <div className="ms-auto flex items-center gap-1.5">
        <button
          onClick={toggleLang}
          className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
        >
          <Translate size={15} />
          {i18n.language === 'ar' ? 'EN' : 'ع'}
        </button>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger className="flex items-center gap-2.5 rounded-full p-1 ps-1 pe-3 transition-colors hover:bg-surface-2 focus:outline-none">
            <Avatar src={profile?.avatar_url} name={profile?.full_name} size={32} />
            <span className="hidden text-sm text-ink sm:block">{profile?.full_name ?? 'Admin'}</span>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className="z-50 w-52 rounded-md border border-line bg-surface-2 p-1 shadow-2xl data-[state=open]:animate-fade-up"
            >
              <div className="px-3 py-2">
                <p className="truncate text-sm text-ink">{profile?.full_name}</p>
                <p className="truncate text-xs text-ink-faint">{profile?.email}</p>
              </div>
              <div className="my-1 h-px bg-line" />
              <DropdownMenu.Item
                onSelect={() => void logout()}
                className="flex cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-sm text-ink-muted outline-none data-[highlighted]:bg-surface-3 data-[highlighted]:text-ink"
              >
                <SignOut size={16} />
                {t('common.logout')}
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
