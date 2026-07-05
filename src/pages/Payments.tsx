import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { createColumnHelper } from '@tanstack/react-table';
import { Receipt, TrendUp } from '@phosphor-icons/react';
import { getData, getList } from '@/lib/api';
import type { AdminStats, Payment } from '@/types/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatMoney, formatDateTime } from '@/lib/format';

const col = createColumnHelper<Payment>();

export default function Payments() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');

  const params = useMemo(() => {
    const p: Record<string, string | number> = { page, limit: 12 };
    if (status !== 'all') p.status = status;
    if (type !== 'all') p.type = type;
    return p;
  }, [page, status, type]);

  const paymentsQ = useQuery({ queryKey: ['payments', params], queryFn: () => getList<Payment>('/admin/payments', { params }) });
  const statsQ = useQuery({ queryKey: ['stats'], queryFn: () => getData<AdminStats>('/admin/stats') });

  const reset = (fn: (v: string) => void) => (v: string) => {
    fn(v);
    setPage(1);
  };

  const columns = useMemo(
    () => [
      col.display({
        id: 'owner',
        header: t('common.owner'),
        cell: (c) => {
          const p = c.row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar src={p.profile?.avatar_url} name={p.profile?.full_name} size={32} />
              <span className="text-sm text-ink">{p.profile?.full_name ?? '—'}</span>
            </div>
          );
        },
      }),
      col.accessor('type', {
        header: t('common.type'),
        cell: (c) => <Badge tone="neutral">{c.getValue()}</Badge>,
      }),
      col.accessor('amount', {
        header: t('common.amount'),
        cell: (c) => <span className="font-mono text-sm text-ink">{formatMoney(c.getValue())}</span>,
      }),
      col.accessor('status', { header: t('common.status'), cell: (c) => <StatusBadge status={c.getValue()} /> }),
      col.accessor('created_at', {
        header: t('common.date'),
        cell: (c) => <span className="text-sm text-ink-muted">{formatDateTime(c.getValue())}</span>,
      }),
    ],
    [t],
  );

  return (
    <div className="animate-fade-up">
      <PageHeader title={t('payments.title')} subtitle={t('payments.subtitle')} />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="bezel">
          <div className="bezel-core flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-ink-muted">{t('payments.succeededRevenue')}</p>
              <p className="mt-1 font-brand text-3xl text-accent">{formatMoney(statsQ.data?.totalRevenue)}</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-black">
              <TrendUp size={18} weight="bold" />
            </span>
          </div>
        </div>
        <div className="bezel">
          <div className="bezel-core flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-ink-muted">{t('common.rowsTotal', { count: paymentsQ.data?.meta.total ?? 0 })}</p>
              <p className="mt-1 font-brand text-3xl text-ink">{paymentsQ.data?.meta.total ?? 0}</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-3 text-ink-muted">
              <Receipt size={18} />
            </span>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select
          value={status}
          onValueChange={reset(setStatus)}
          options={[
            { value: 'all', label: t('common.status') + ': ' + t('common.all') },
            { value: 'succeeded', label: t('status.succeeded') },
            { value: 'pending', label: t('status.pending') },
            { value: 'failed', label: t('status.failed') },
            { value: 'refunded', label: t('status.refunded') },
          ]}
          className="min-w-[10rem]"
        />
        <Select
          value={type}
          onValueChange={reset(setType)}
          options={[
            { value: 'all', label: t('common.type') + ': ' + t('common.all') },
            { value: 'subscription', label: 'subscription' },
            { value: 'ad', label: 'ad' },
            { value: 'featured', label: 'featured' },
          ]}
          className="min-w-[10rem]"
        />
      </div>

      <DataTable
        columns={columns}
        data={paymentsQ.data?.rows ?? []}
        loading={paymentsQ.isLoading}
        empty={<EmptyState icon={<Receipt size={22} />} title={t('common.noResults')} />}
      />
      {paymentsQ.data ? (
        <Pagination page={page} totalPages={paymentsQ.data.meta.totalPages} total={paymentsQ.data.meta.total} onPageChange={setPage} />
      ) : null}
    </div>
  );
}
