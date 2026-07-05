import { useMemo, useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { createColumnHelper } from '@tanstack/react-table';
import { Flag } from '@phosphor-icons/react';
import { api, getList, errorMessage } from '@/lib/api';
import type { Report, ReportStatus } from '@/types/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Field, Textarea } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { toast } from '@/components/ui/Toaster';
import { formatDateTime } from '@/lib/format';

const col = createColumnHelper<Report>();
const REPORT_STATUSES: ReportStatus[] = ['pending', 'reviewed', 'resolved', 'dismissed'];

export default function Reports() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');
  const [active, setActive] = useState<Report | null>(null);
  const [draftStatus, setDraftStatus] = useState<ReportStatus>('pending');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (active) {
      setDraftStatus(active.status);
      setNote(active.admin_note ?? '');
    }
  }, [active]);

  const params = useMemo(() => {
    const p: Record<string, string | number> = { page, limit: 12 };
    if (status !== 'all') p.status = status;
    if (type !== 'all') p.type = type;
    return p;
  }, [page, status, type]);

  const reportsQ = useQuery({ queryKey: ['reports', params], queryFn: () => getList<Report>('/admin/reports', { params }) });

  const updateM = useMutation({
    mutationFn: () => api.patch(`/admin/reports/${active!.id}/status`, { status: draftStatus, admin_note: note || undefined }),
    onSuccess: () => {
      toast.success(t('reports.updateStatus'));
      qc.invalidateQueries({ queryKey: ['reports'] });
      setActive(null);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const reset = (fn: (v: string) => void) => (v: string) => {
    fn(v);
    setPage(1);
  };

  const columns = useMemo(
    () => [
      col.accessor('reason', { header: t('reports.reason'), cell: (c) => <span className="font-medium text-ink">{c.getValue()}</span> }),
      col.accessor('reported_type', { header: t('reports.reportedType'), cell: (c) => <Badge tone="neutral">{c.getValue()}</Badge> }),
      col.accessor('status', { header: t('common.status'), cell: (c) => <StatusBadge status={c.getValue()} /> }),
      col.accessor('created_at', { header: t('common.date'), cell: (c) => <span className="text-sm text-ink-muted">{formatDateTime(c.getValue())}</span> }),
    ],
    [t],
  );

  return (
    <div className="animate-fade-up">
      <PageHeader title={t('reports.title')} subtitle={t('reports.subtitle')} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select
          value={status}
          onValueChange={reset(setStatus)}
          options={[{ value: 'all', label: t('common.status') + ': ' + t('common.all') }, ...REPORT_STATUSES.map((s) => ({ value: s, label: t(`status.${s}`) }))]}
          className="min-w-[10rem]"
        />
        <Select
          value={type}
          onValueChange={reset(setType)}
          options={[
            { value: 'all', label: t('common.type') + ': ' + t('common.all') },
            ...['profile', 'offer', 'ad', 'message', 'service', 'story', 'seat'].map((s) => ({ value: s, label: s })),
          ]}
          className="min-w-[10rem]"
        />
      </div>

      <DataTable
        columns={columns}
        data={reportsQ.data?.rows ?? []}
        loading={reportsQ.isLoading}
        onRowClick={setActive}
        empty={<EmptyState icon={<Flag size={22} />} title={t('common.noResults')} />}
      />
      {reportsQ.data ? (
        <Pagination page={page} totalPages={reportsQ.data.meta.totalPages} total={reportsQ.data.meta.total} onPageChange={setPage} />
      ) : null}

      <Modal
        open={!!active}
        onOpenChange={(o) => !o && setActive(null)}
        title={active?.reason ?? ''}
        description={active ? `${active.reported_type} · ${formatDateTime(active.created_at)}` : undefined}
        footer={
          <>
            <Button variant="ghost" onClick={() => setActive(null)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={() => updateM.mutate()} disabled={updateM.isPending}>
              {t('common.save')}
            </Button>
          </>
        }
      >
        {active ? (
          <div className="space-y-4">
            {active.details ? <p className="rounded-md bg-surface-2 p-3 text-sm text-ink-muted">{active.details}</p> : null}
            <Field label={t('common.status')}>
              <Select
                value={draftStatus}
                onValueChange={(v) => setDraftStatus(v as ReportStatus)}
                options={REPORT_STATUSES.map((s) => ({ value: s, label: t(`status.${s}`) }))}
                className="w-full"
              />
            </Field>
            <Field label={t('reports.note')}>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('reports.notePlaceholder')} />
            </Field>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
