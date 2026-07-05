import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Trophy, SealCheck } from '@phosphor-icons/react';
import { getList } from '@/lib/api';
import type { LeaderboardEntry } from '@/types/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCompact } from '@/lib/format';
import { cn } from '@/lib/utils';

const medalColor = (rank: number) =>
  rank === 1 ? '#ffe604' : rank === 2 ? '#cfcfd4' : rank === 3 ? '#cd7f32' : undefined;

function RankBadge({ rank }: { rank: number }) {
  const color = medalColor(rank);
  return (
    <div
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-brand text-sm',
        color ? 'text-black' : 'bg-surface-3 text-ink-muted',
      )}
      style={color ? { background: color } : undefined}
    >
      {rank}
    </div>
  );
}

export default function Cup() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [type, setType] = useState('all');

  const q = useQuery({
    queryKey: ['leaderboard', type, page],
    queryFn: () => getList<LeaderboardEntry>('/leaderboard', { params: { page, limit: 20, type } }),
  });
  const rows = q.data?.rows ?? [];

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={t('cup.title')}
        subtitle={t('cup.subtitle')}
        actions={
          <Select
            value={type}
            onValueChange={(v) => {
              setType(v);
              setPage(1);
            }}
            options={[
              { value: 'all', label: t('common.all') },
              { value: 'company', label: t('accountType.company') },
              { value: 'influencer', label: t('accountType.influencer') },
              { value: 'service_provider', label: t('accountType.service_provider') },
            ]}
            className="min-w-[10rem]"
          />
        }
      />

      {q.isLoading ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : rows.length ? (
        <Card className="divide-y divide-line overflow-hidden">
          {rows.map((e) => (
            <div
              key={e.id}
              className={cn(
                'flex items-center gap-4 px-4 py-3 transition-colors hover:bg-surface-2',
                e.rank <= 3 && 'bg-surface-1',
              )}
            >
              <RankBadge rank={e.rank} />
              <Avatar src={e.avatar_url} name={e.full_name} size={40} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate font-medium text-ink">
                  {e.full_name ?? '—'}
                  {e.is_verified ? <SealCheck size={14} weight="fill" className="text-info" /> : null}
                </p>
                <p className="truncate text-xs text-ink-faint">{e.username ? `@${e.username}` : t(`accountType.${e.account_type}`)}</p>
              </div>
              <Badge tone="neutral" className="hidden sm:inline-flex">{t(`accountType.${e.account_type}`)}</Badge>
              <div className="text-end">
                <p className="font-brand text-lg text-accent">{formatCompact(e.followers_count)}</p>
                <p className="text-[10px] uppercase tracking-wider text-ink-faint">{t('cup.followers')}</p>
              </div>
            </div>
          ))}
        </Card>
      ) : (
        <EmptyState icon={<Trophy size={22} />} title={t('common.noResults')} />
      )}

      {q.data ? <Pagination page={page} totalPages={q.data.meta.totalPages} total={q.data.meta.total} onPageChange={setPage} /> : null}
    </div>
  );
}
