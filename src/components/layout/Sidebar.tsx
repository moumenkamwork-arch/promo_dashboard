import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Logo } from '@/components/Logo';
import { navGroups } from './nav';
import { cn } from '@/lib/utils';

export function Sidebar({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const { t } = useTranslation();

  return (
    <aside
      className="flex h-full flex-col border-e border-line bg-surface-1"
      style={{ width: collapsed ? 'var(--sidebar-w-collapsed)' : 'var(--sidebar-w)' }}
    >
      <div className={cn('flex h-16 items-center border-b border-line', collapsed ? 'justify-center px-2' : 'px-5')}>
        <Logo wordmark={!collapsed} size={28} />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navGroups.map((group) => (
          <div key={group.labelKey} className="mb-5">
            {!collapsed ? (
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
                {t(group.labelKey)}
              </p>
            ) : (
              <div className="mx-3 mb-2 h-px bg-line" />
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.key}>
                    <NavLink
                      to={item.path}
                      end={item.path === '/'}
                      onClick={onNavigate}
                      title={collapsed ? t(`nav.${item.key}`) : undefined}
                      className={({ isActive }) =>
                        cn(
                          'group relative flex items-center rounded-md text-sm transition-colors duration-200',
                          collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5',
                          isActive
                            ? 'bg-surface-3 text-ink'
                            : 'text-ink-muted hover:bg-surface-2 hover:text-ink',
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {/* signature: yellow rail dot marks the active route */}
                          <span
                            className={cn(
                              'absolute inset-y-1.5 start-0 w-0.5 rounded-full bg-accent transition-opacity',
                              isActive ? 'opacity-100' : 'opacity-0',
                            )}
                            aria-hidden
                          />
                          <Icon size={20} weight={isActive ? 'fill' : 'regular'} className={isActive ? 'text-accent' : ''} />
                          {!collapsed ? <span className="truncate">{t(`nav.${item.key}`)}</span> : null}
                        </>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {!collapsed ? (
        <div className="border-t border-line px-5 py-3">
          <p className="text-[10px] text-ink-faint">Promoo Admin · v1.0</p>
        </div>
      ) : null}
    </aside>
  );
}
