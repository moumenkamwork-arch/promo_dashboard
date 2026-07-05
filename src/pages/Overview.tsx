import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Users, Megaphone, Flag, CurrencyDollar, ArrowUpRight } from '@phosphor-icons/react';
import { getData, getList } from '@/lib/api';
import type { AdminStats, Payment, Report } from '@/types/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatMoney, formatNumber, relativeTime } from '@/lib/format';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function KpiCard({
  icon,
  label,
  value,
  loading,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  loading?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="bezel">
      <div className="bezel-core p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-muted">{label}</span>
          <span
            className={
              'flex h-8 w-8 items-center justify-center rounded-full ' +
              (highlight ? 'bg-accent text-black' : 'bg-surface-3 text-ink-muted')
            }
          >
            {icon}
          </span>
        </div>
        {loading ? (
          <Skeleton className="mt-3 h-8 w-24" />
        ) : (
          <p className={'mt-2 font-brand text-3xl ' + (highlight ? 'text-accent' : 'text-ink')}>{value}</p>
        )}
      </div>
    </div>
  );
}

export default function Overview() {
  const { t } = useTranslation();

  const statsQ = useQuery({ queryKey: ['stats'], queryFn: () => getData<AdminStats>('/admin/stats') });
  const paymentsQ = useQuery({
    queryKey: ['payments', 'overview'],
    queryFn: () => getList<Payment>('/admin/payments', { params: { page: 1, limit: 100 } }),
  });
  const reportsQ = useQuery({
    queryKey: ['reports', 'overview'],
    queryFn: () => getList<Report>('/admin/reports', { params: { page: 1, limit: 5 } }),
  });

  const revenueSeries = useMemo(() => {
    const rows = paymentsQ.data?.rows ?? [];
    const buckets = new Map<string, number>();
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.set(`${d.getFullYear()}-${d.getMonth()}`, 0);
    }
    for (const p of rows) {
      if (p.status !== 'succeeded') continue;
      const d = new Date(p.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + Number(p.amount));
    }
    return Array.from(buckets.entries()).map(([key, total]) => {
      const month = Number(key.split('-')[1]);
      return { label: MONTHS[month], total };
    });
  }, [paymentsQ.data]);

  const recentPayments = (paymentsQ.data?.rows ?? []).slice(0, 5);
  const recentReports = reportsQ.data?.rows ?? [];

  return (
    <div className="animate-fade-up">
      <PageHeader title={t('overview.title')} subtitle={t('overview.subtitle')} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={<Users size={16} />} label={t('overview.totalUsers')} value={formatNumber(statsQ.data?.totalUsers)} loading={statsQ.isLoading} />
        <KpiCard icon={<Megaphone size={16} />} label={t('overview.activeAds')} value={formatNumber(statsQ.data?.activeAds)} loading={statsQ.isLoading} />
        <KpiCard icon={<Flag size={16} />} label={t('overview.pendingReports')} value={formatNumber(statsQ.data?.pendingReports)} loading={statsQ.isLoading} />
        <KpiCard icon={<CurrencyDollar size={16} weight="bold" />} label={t('overview.totalRevenue')} value={formatMoney(statsQ.data?.totalRevenue)} loading={statsQ.isLoading} highlight />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('overview.revenueTrend')}</CardTitle>
            <span className="text-xs text-ink-faint">AED · last 6 months</span>
          </CardHeader>
          <CardBody>
            {paymentsQ.isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={256}>
                <AreaChart data={revenueSeries} margin={{ left: -18, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ffe604" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#ffe604" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="label" stroke="#76767d" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#76767d" fontSize={12} tickLine={false} axisLine={false} width={56} />
                  <Tooltip
                    cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
                    contentStyle={{
                      background: 'var(--color-surface-2)',
                      border: '1px solid var(--color-line)',
                      borderRadius: 12,
                      color: 'var(--color-ink)',
                      fontSize: 12,
                    }}
                    formatter={(v: number) => [formatMoney(v), 'Revenue']}
                  />
                  <Area type="monotone" dataKey="total" stroke="#ffe604" strokeWidth={2} fill="url(#rev)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('overview.recentReports')}</CardTitle>
            <Link to="/reports" className="text-xs text-accent hover:underline">
              {t('overview.viewAll')}
            </Link>
          </CardHeader>
          <CardBody className="space-y-1 pt-2">
            {reportsQ.isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
            ) : recentReports.length ? (
              recentReports.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 rounded-md px-2 py-2 hover:bg-surface-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-ink">{r.reason}</p>
                    <p className="text-xs text-ink-faint">
                      {t(`reports.reportedType`)}: {r.reported_type} · {relativeTime(r.created_at)}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              ))
            ) : (
              <p className="px-2 py-6 text-center text-sm text-ink-faint">{t('common.noResults')}</p>
            )}
          </CardBody>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>{t('overview.recentPayments')}</CardTitle>
          <Link to="/payments" className="flex items-center gap-1 text-xs text-accent hover:underline">
            {t('overview.viewAll')} <ArrowUpRight size={12} />
          </Link>
        </CardHeader>
        <CardBody className="pt-2">
          {paymentsQ.isLoading ? (
            <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : recentPayments.length ? (
            <div className="divide-y divide-line">
              {recentPayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <Avatar src={p.profile?.avatar_url} name={p.profile?.full_name} size={32} />
                    <div>
                      <p className="text-sm text-ink">{p.profile?.full_name ?? '—'}</p>
                      <p className="text-xs text-ink-faint capitalize">{p.type} · {relativeTime(p.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-ink">{formatMoney(p.amount)}</span>
                    <StatusBadge status={p.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-ink-faint">{t('common.noResults')}</p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
