import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { createColumnHelper } from '@tanstack/react-table';
import { DotsThree, MagnifyingGlass, SealCheck, Prohibit, Trash, CheckCircle, Eye } from '@phosphor-icons/react';
import { api, getList, errorMessage } from '@/lib/api';
import type { AccountType, Profile } from '@/types/api';
import { useDebounce } from '@/lib/useDebounce';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toaster';
import { formatCompact, formatDate } from '@/lib/format';

const col = createColumnHelper<Profile>();
const accountTones: Record<AccountType, 'info' | 'accent' | 'ok' | 'neutral'> = {
  company: 'info',
  influencer: 'accent',
  service_provider: 'ok',
  user: 'neutral',
};

export default function Users() {
  const { t } = useTranslation();
  const qc = useQueryClient();

  const [page, setPage] = useState(1);
  const [searchRaw, setSearchRaw] = useState('');
  const search = useDebounce(searchRaw);
  const [accountType, setAccountType] = useState('all');
  const [isVerified, setIsVerified] = useState('all');
  const [isActive, setIsActive] = useState('all');

  const [detail, setDetail] = useState<Profile | null>(null);
  const [confirm, setConfirm] = useState<{ kind: 'ban' | 'delete'; user: Profile } | null>(null);

  const params = useMemo(() => {
    const p: Record<string, string | number> = { page, limit: 12 };
    if (search) p.search = search;
    if (accountType !== 'all') p.accountType = accountType;
    if (isVerified !== 'all') p.isVerified = isVerified;
    if (isActive !== 'all') p.isActive = isActive;
    return p;
  }, [page, search, accountType, isVerified, isActive]);

  const usersQ = useQuery({
    queryKey: ['users', params],
    queryFn: () => getList<Profile>('/admin/users', { params }),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['users'] });

  const verifyM = useMutation({
    mutationFn: (u: Profile) => api.patch(`/admin/users/${u.id}/verify`, { isVerified: !u.is_verified }),
    onSuccess: (_d, u) => {
      toast.success(u.is_verified ? t('users.unverify') : t('users.verify'));
      invalidate();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const banM = useMutation({
    mutationFn: (u: Profile) => api.patch(`/admin/users/${u.id}/ban`, { isActive: !u.is_active }),
    onSuccess: (_d, u) => {
      toast.success(u.is_active ? t('users.ban') : t('users.unban'));
      invalidate();
      setConfirm(null);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const deleteM = useMutation({
    mutationFn: (u: Profile) => api.delete(`/admin/users/${u.id}`),
    onSuccess: () => {
      toast.success(t('common.delete'));
      invalidate();
      setConfirm(null);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const onSearch = (v: string) => {
    setSearchRaw(v);
    setPage(1);
  };
  const onFilter = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setPage(1);
  };

  const columns = useMemo(
    () => [
      col.accessor('full_name', {
        header: t('common.name'),
        cell: (c) => {
          const u = c.row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar src={u.avatar_url} name={u.full_name} size={36} />
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{u.full_name ?? '—'}</p>
                <p className="truncate text-xs text-ink-faint">{u.username ? `@${u.username}` : u.email}</p>
              </div>
            </div>
          );
        },
      }),
      col.accessor('account_type', {
        header: t('common.type'),
        cell: (c) => <Badge tone={accountTones[c.getValue()]}>{t(`accountType.${c.getValue()}`)}</Badge>,
      }),
      col.display({
        id: 'status',
        header: t('common.status'),
        cell: (c) => {
          const u = c.row.original;
          return (
            <div className="flex flex-wrap gap-1.5">
              {u.is_verified ? (
                <Badge tone="info">
                  <SealCheck size={12} weight="fill" /> {t('users.verified')}
                </Badge>
              ) : null}
              <Badge tone={u.is_active ? 'ok' : 'danger'}>{u.is_active ? t('users.active') : t('users.banned')}</Badge>
            </div>
          );
        },
      }),
      col.accessor('followers_count', {
        header: t('users.followers'),
        cell: (c) => <span className="font-mono text-sm text-ink-muted">{formatCompact(c.getValue())}</span>,
      }),
      col.accessor('created_at', {
        header: t('users.joined'),
        cell: (c) => <span className="text-sm text-ink-muted">{formatDate(c.getValue())}</span>,
      }),
      col.display({
        id: 'actions',
        header: '',
        cell: (c) => {
          const u = c.row.original;
          return (
            <div className="flex justify-end">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger
                  className="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-surface-3 hover:text-ink"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DotsThree size={20} weight="bold" />
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="end"
                    sideOffset={6}
                    className="z-50 w-48 rounded-md border border-line bg-surface-2 p-1 shadow-2xl data-[state=open]:animate-fade-up"
                  >
                    <MenuItem icon={<Eye size={15} />} onSelect={() => setDetail(u)}>
                      {t('common.view')}
                    </MenuItem>
                    <MenuItem
                      icon={u.is_verified ? <SealCheck size={15} /> : <CheckCircle size={15} />}
                      onSelect={() => verifyM.mutate(u)}
                    >
                      {u.is_verified ? t('users.unverify') : t('users.verify')}
                    </MenuItem>
                    <MenuItem icon={<Prohibit size={15} />} onSelect={() => setConfirm({ kind: 'ban', user: u })}>
                      {u.is_active ? t('users.ban') : t('users.unban')}
                    </MenuItem>
                    <div className="my-1 h-px bg-line" />
                    <MenuItem icon={<Trash size={15} />} danger onSelect={() => setConfirm({ kind: 'delete', user: u })}>
                      {t('common.delete')}
                    </MenuItem>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          );
        },
      }),
    ],
    [t, verifyM],
  );

  return (
    <div className="animate-fade-up">
      <PageHeader title={t('users.title')} subtitle={t('users.subtitle')} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[14rem] flex-1">
          <MagnifyingGlass size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            value={searchRaw}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={t('common.search')}
            className="h-10 w-full rounded-md border border-line bg-surface-2 ps-9 pe-3 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <Select
          value={accountType}
          onValueChange={onFilter(setAccountType)}
          options={[
            { value: 'all', label: t('common.all') },
            { value: 'company', label: t('accountType.company') },
            { value: 'influencer', label: t('accountType.influencer') },
            { value: 'service_provider', label: t('accountType.service_provider') },
            { value: 'user', label: t('accountType.user') },
          ]}
          className="min-w-[8rem]"
        />
        <Select
          value={isVerified}
          onValueChange={onFilter(setIsVerified)}
          options={[
            { value: 'all', label: t('users.verified') + ': ' + t('common.all') },
            { value: 'true', label: t('users.verified') },
            { value: 'false', label: t('common.none') },
          ]}
          className="min-w-[9rem]"
        />
        <Select
          value={isActive}
          onValueChange={onFilter(setIsActive)}
          options={[
            { value: 'all', label: t('users.active') + ': ' + t('common.all') },
            { value: 'true', label: t('users.active') },
            { value: 'false', label: t('users.banned') },
          ]}
          className="min-w-[9rem]"
        />
      </div>

      {/* No row-level onClick on purpose: the View modal opens ONLY via the
          explicit "View" menu item. A row click handler here would swallow the
          click-through that happens when a Radix dropdown item closes the
          portal, opening the detail modal on top of the Ban/Delete confirm
          dialogs and blocking those actions entirely. */}
      <DataTable
        columns={columns}
        data={usersQ.data?.rows ?? []}
        loading={usersQ.isLoading}
        empty={<EmptyState icon={<MagnifyingGlass size={22} />} title={t('common.noResults')} />}
      />

      {usersQ.data ? (
        <Pagination
          page={page}
          totalPages={usersQ.data.meta.totalPages}
          total={usersQ.data.meta.total}
          onPageChange={setPage}
        />
      ) : null}

      {/* Detail modal */}
      <Modal open={!!detail} onOpenChange={(o) => !o && setDetail(null)} title={detail?.full_name ?? ''} size="md">
        {detail ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar src={detail.avatar_url} name={detail.full_name} size={56} />
              <div>
                <p className="font-brand text-lg text-ink">{detail.full_name}</p>
                <p className="text-sm text-ink-faint">{detail.username ? `@${detail.username}` : '—'}</p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <Detail label={t('login.email')} value={detail.email ?? '—'} />
              <Detail label={t('common.type')} value={t(`accountType.${detail.account_type}`)} />
              <Detail label={t('users.followers')} value={formatCompact(detail.followers_count)} />
              <Detail label={t('users.joined')} value={formatDate(detail.created_at)} />
              <Detail label={t('users.verified')} value={detail.is_verified ? '✓' : '—'} />
              <Detail label={t('users.active')} value={detail.is_active ? '✓' : t('users.banned')} />
            </dl>
            {detail.bio ? <p className="rounded-md bg-surface-2 p-3 text-sm text-ink-muted">{detail.bio}</p> : null}
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={confirm?.kind === 'ban'}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={confirm?.user.is_active ? t('users.ban') : t('users.unban')}
        message={t(confirm?.user.is_active ? 'users.banConfirm' : 'users.unbanConfirm', { name: confirm?.user.full_name ?? '' })}
        confirmLabel={confirm?.user.is_active ? t('users.ban') : t('users.unban')}
        destructive={confirm?.user.is_active}
        busy={banM.isPending}
        onConfirm={() => confirm && banM.mutate(confirm.user)}
      />
      <ConfirmDialog
        open={confirm?.kind === 'delete'}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={t('common.delete')}
        message={t('users.deleteConfirm', { name: confirm?.user.full_name ?? '' })}
        confirmLabel={t('common.delete')}
        busy={deleteM.isPending}
        onConfirm={() => confirm && deleteM.mutate(confirm.user)}
      />
    </div>
  );
}

function MenuItem({
  icon,
  children,
  onSelect,
  danger,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  onSelect: () => void;
  danger?: boolean;
}) {
  return (
    <DropdownMenu.Item
      onSelect={onSelect}
      className={
        'flex cursor-pointer items-center gap-2.5 rounded-sm px-3 py-2 text-sm outline-none data-[highlighted]:bg-surface-3 ' +
        (danger ? 'text-danger' : 'text-ink-muted data-[highlighted]:text-ink')
      }
    >
      {icon}
      {children}
    </DropdownMenu.Item>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-ink-faint">{label}</dt>
      <dd className="mt-0.5 text-ink">{value}</dd>
    </div>
  );
}
