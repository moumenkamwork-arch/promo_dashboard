import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { DotsThree, Trash, ImageSquare, SquaresFour, ArrowsClockwise, Star } from '@phosphor-icons/react';
import { api, getList, errorMessage } from '@/lib/api';
import type { Offer, Service } from '@/types/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { Tabs, TabPanel } from '@/components/ui/Tabs';
import { Pagination } from '@/components/ui/Pagination';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toaster';
import { formatMoney } from '@/lib/format';

type Kind = 'offers' | 'services';
const OFFER_STATUSES = ['active', 'draft', 'expired', 'rejected'];

function Thumb({ url }: { url?: string | null }) {
  return url ? (
    <img src={url} alt="" className="h-10 w-10 shrink-0 rounded-md object-cover" />
  ) : (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-3 text-ink-faint">
      <ImageSquare size={18} />
    </div>
  );
}

function OwnerCell({ profile }: { profile?: Partial<{ full_name: string | null; avatar_url: string | null; username: string | null }> }) {
  return (
    <div className="flex items-center gap-2">
      <Avatar src={profile?.avatar_url} name={profile?.full_name} size={26} />
      <span className="text-sm text-ink-muted">{profile?.full_name ?? '—'}</span>
    </div>
  );
}

export default function Content() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Kind>('offers');
  const [page, setPage] = useState(1);
  const [del, setDel] = useState<{ kind: Kind; id: string; title: string } | null>(null);

  const params = { page, limit: 10 };
  // Admin moderation lists return ALL statuses (pending/draft/rejected) so admins
  // can review and act — the public list endpoints only expose active content.
  const offersQ = useQuery({ queryKey: ['content', 'offers', page], queryFn: () => getList<Offer>('/admin/content/offers', { params }), enabled: tab === 'offers' });
  const servicesQ = useQuery({ queryKey: ['content', 'services', page], queryFn: () => getList<Service>('/admin/content/services', { params }), enabled: tab === 'services' });

  const statusM = useMutation({
    mutationFn: ({ kind, id, status }: { kind: 'offers' | 'ads'; id: string; status: string }) =>
      api.patch(`/admin/content/${kind}/${id}/status`, { status }),
    onSuccess: () => {
      toast.success(t('content.changeStatus'));
      qc.invalidateQueries({ queryKey: ['content'] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const deleteM = useMutation({
    mutationFn: ({ kind, id }: { kind: 'offers' | 'ads'; id: string }) => api.delete(`/admin/content/${kind}/${id}`),
    onSuccess: () => {
      toast.success(t('common.delete'));
      qc.invalidateQueries({ queryKey: ['content'] });
      setDel(null);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  // v1 interim: manual "feature" toggle. Flips offers.is_featured — the same flag
  // Stripe would flip in v2 — which drives both Promoo of the Day and Top Offers on
  // the mobile home. See promo_mobile/docs/v1_interim_admin_curation.md.
  const featureM = useMutation({
    mutationFn: ({ id, is_featured }: { id: string; is_featured: boolean }) =>
      api.patch(`/admin/content/offers/${id}/feature`, { is_featured }),
    onSuccess: (_d, v) => {
      toast.success(t(v.is_featured ? 'content.featureDone' : 'content.unfeatureDone'));
      qc.invalidateQueries({ queryKey: ['content'] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const changeTab = (v: string) => {
    setTab(v as Kind);
    setPage(1);
  };

  const activeQ = tab === 'offers' ? offersQ : servicesQ;

  const StatusActions = ({ kind, id, title, statuses, featured }: { kind: 'offers'; id: string; title: string; statuses: string[]; featured?: boolean }) => (
    <div className="flex justify-end">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger className="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-surface-3 hover:text-ink">
          <DotsThree size={20} weight="bold" />
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={6}
            className="z-50 w-64 rounded-md border border-line bg-surface-2 p-1 shadow-2xl data-[state=open]:animate-fade-up"
          >
            {featured !== undefined ? (
              <>
                <DropdownMenu.Item
                  onSelect={() => featureM.mutate({ id, is_featured: !featured })}
                  className="flex cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-sm text-ink-muted outline-none data-[highlighted]:bg-surface-3 data-[highlighted]:text-ink"
                >
                  <Star size={14} weight={featured ? 'fill' : 'regular'} className={featured ? '' : 'text-accent'} />
                  {t(featured ? 'content.unfeature' : 'content.feature')}
                </DropdownMenu.Item>
                <div className="my-1 h-px bg-line" />
              </>
            ) : null}
            <p className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-ink-faint">{t('content.changeStatus')}</p>
            {statuses.map((s) => (
              <DropdownMenu.Item
                key={s}
                onSelect={() => statusM.mutate({ kind, id, status: s })}
                className="flex cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-sm text-ink-muted outline-none data-[highlighted]:bg-surface-3 data-[highlighted]:text-ink"
              >
                <ArrowsClockwise size={14} />
                {t(`status.${s}`)}
              </DropdownMenu.Item>
            ))}
            <div className="my-1 h-px bg-line" />
            <DropdownMenu.Item
              onSelect={() => setDel({ kind, id, title })}
              className="flex cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-sm text-danger outline-none data-[highlighted]:bg-surface-3"
            >
              <Trash size={14} /> {t('common.delete')}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );

  return (
    <div className="animate-fade-up">
      <PageHeader title={t('content.title')} subtitle={t('content.subtitle')} />

      <Tabs
        value={tab}
        onValueChange={changeTab}
        tabs={[
          { value: 'offers', label: t('content.offers') },
          { value: 'services', label: t('content.services') },
        ]}
      >
        <div className="pt-4">
          {activeQ.isLoading ? (
            <TableSkeleton cols={5} />
          ) : (
            <>
              <TabPanel value="offers">
                <ContentTable
                  rows={offersQ.data?.rows ?? []}
                  empty={<EmptyState icon={<SquaresFour size={22} />} title={t('common.noResults')} />}
                  columns={['thumb', 'title', 'owner', 'price', 'status', 'actions']}
                  render={(o: Offer) => ({
                    thumb: <Thumb url={o.media_urls?.[0]} />,
                    title: (
                      <span className="flex items-center gap-1.5 font-medium text-ink">
                        {o.is_featured ? (
                          <span className="shrink-0 leading-none" title={t('content.featured')}>
                            <Star size={14} weight="fill" className="text-accent" />
                          </span>
                        ) : null}
                        {o.title}
                      </span>
                    ),
                    owner: <OwnerCell profile={o.profile} />,
                    price: <span className="font-mono text-sm">{formatMoney(o.offer_price)}</span>,
                    status: <StatusBadge status={o.status} />,
                    actions: <StatusActions kind="offers" id={o.id} title={o.title} statuses={OFFER_STATUSES} featured={o.is_featured} />,
                  })}
                />
              </TabPanel>
              <TabPanel value="services">
                <ContentTable
                  rows={servicesQ.data?.rows ?? []}
                  empty={<EmptyState icon={<SquaresFour size={22} />} title={t('common.noResults')} />}
                  columns={['title', 'owner', 'price', 'status']}
                  render={(s: Service) => ({
                    title: <span className="font-medium text-ink">{s.title}</span>,
                    owner: <OwnerCell profile={s.profile} />,
                    price: <span className="font-mono text-sm">{formatMoney(s.price)}</span>,
                    status: <StatusBadge status={s.status} />,
                  })}
                />
              </TabPanel>
            </>
          )}

          {activeQ.data ? (
            <Pagination page={page} totalPages={activeQ.data.meta.totalPages} total={activeQ.data.meta.total} onPageChange={setPage} />
          ) : null}
        </div>
      </Tabs>

      <ConfirmDialog
        open={!!del}
        onOpenChange={(o) => !o && setDel(null)}
        title={t('common.delete')}
        message={t('users.deleteConfirm', { name: del?.title || 'this item' })}
        confirmLabel={t('common.delete')}
        busy={deleteM.isPending}
        onConfirm={() => del && del.kind !== 'services' && deleteM.mutate({ kind: del.kind, id: del.id })}
      />
    </div>
  );
}

const HEADERS: Record<string, string> = {
  thumb: '',
  title: 'common.title',
  owner: 'common.owner',
  price: 'common.price',
  status: 'common.status',
  actions: '',
};

function ContentTable<T extends { id: string }>({
  rows,
  columns,
  render,
  empty,
}: {
  rows: T[];
  columns: string[];
  render: (row: T) => Record<string, React.ReactNode>;
  empty: React.ReactNode;
}) {
  const { t } = useTranslation();
  if (!rows.length) return <>{empty}</>;
  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-line bg-surface-1">
            {columns.map((c) => (
              <th key={c} className="px-5 py-3 text-start text-[11px] font-medium uppercase tracking-wider text-ink-faint">
                {HEADERS[c] ? t(HEADERS[c]) : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => {
            const cells = render(row);
            return (
              <tr key={row.id} className="bg-surface-1 transition-colors hover:bg-surface-2">
                {columns.map((c) => (
                  <td key={c} className={'px-5 py-3 ' + (c === 'actions' ? 'text-end' : '')}>
                    {cells[c]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
