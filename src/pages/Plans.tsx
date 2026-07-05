import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Plus, PencilSimple, Trash, Warning, CreditCard } from '@phosphor-icons/react';
import { api, getData, errorMessage } from '@/lib/api';
import type { PlanInterval, SubscriptionPlan } from '@/types/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Field, Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { TagInput } from '@/components/ui/TagInput';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/Toaster';
import { formatMoney } from '@/lib/format';

type Draft = Partial<SubscriptionPlan>;
const empty: Draft = {
  name_en: '', name_ar: '', description_en: '', description_ar: '',
  price: 0, currency: 'AED', interval: 'monthly', stripe_price_id: '',
  sort_order: 0, features_en: [], features_ar: [], is_active: true,
};

export default function Plans() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Draft | null>(null);
  const [del, setDel] = useState<SubscriptionPlan | null>(null);

  const plansQ = useQuery({ queryKey: ['plans'], queryFn: () => getData<SubscriptionPlan[]>('/admin/plans') });
  const plans = plansQ.data ?? [];
  const hasPlaceholder = plans.some((p) => p.stripe_price_id?.includes('placeholder'));

  const saveM = useMutation({
    mutationFn: (d: Draft) => (d.id ? api.put(`/admin/plans/${d.id}`, d) : api.post('/admin/plans', d)),
    onSuccess: () => {
      toast.success(t('common.save'));
      qc.invalidateQueries({ queryKey: ['plans'] });
      setEditing(null);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const deleteM = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/plans/${id}`),
    onSuccess: () => {
      toast.success(t('common.delete'));
      qc.invalidateQueries({ queryKey: ['plans'] });
      setDel(null);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={t('plans.title')}
        subtitle={t('plans.subtitle')}
        actions={
          <Button onClick={() => setEditing(empty)}>
            <Plus size={16} weight="bold" /> {t('plans.newPlan')}
          </Button>
        }
      />

      {hasPlaceholder ? (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-warn-soft bg-warn-soft px-4 py-2.5 text-sm text-warn">
          <Warning size={16} weight="fill" />
          {t('plans.placeholderWarn')}
        </div>
      ) : null}

      {plansQ.isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-56 w-full" />)}
        </div>
      ) : plans.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((p) => (
            <Card key={p.id} className="flex flex-col p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-brand text-lg text-ink">{p.name_en}</p>
                  <p className="text-sm text-ink-faint" dir="rtl">{p.name_ar}</p>
                </div>
                <Badge tone={p.is_active ? 'ok' : 'neutral'}>{p.is_active ? t('users.active') : t('common.none')}</Badge>
              </div>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="font-brand text-3xl text-accent">{formatMoney(p.price)}</span>
                <span className="text-sm text-ink-faint">/ {t(`status.${p.interval}`, p.interval)}</span>
              </div>
              {p.features_en?.length ? (
                <ul className="mt-4 flex-1 space-y-1.5">
                  {p.features_en.slice(0, 4).map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-ink-muted">
                      <span className="h-1 w-1 rounded-full bg-accent" /> {f}
                    </li>
                  ))}
                </ul>
              ) : <div className="flex-1" />}
              {p.stripe_price_id?.includes('placeholder') ? (
                <p className="mt-3 truncate font-mono text-[10px] text-warn">{p.stripe_price_id}</p>
              ) : (
                <p className="mt-3 truncate font-mono text-[10px] text-ink-faint">{p.stripe_price_id}</p>
              )}
              <div className="mt-4 flex gap-2 border-t border-line pt-4">
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => setEditing(p)}>
                  <PencilSimple size={14} /> {t('common.edit')}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDel(p)} aria-label={t('common.delete')}>
                  <Trash size={16} className="text-danger" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<CreditCard size={22} />}
          title={t('common.noResults')}
          action={<Button onClick={() => setEditing(empty)}><Plus size={16} /> {t('plans.newPlan')}</Button>}
        />
      )}

      {editing ? <PlanForm draft={editing} onClose={() => setEditing(null)} onSave={(d) => saveM.mutate(d)} busy={saveM.isPending} /> : null}

      <ConfirmDialog
        open={!!del}
        onOpenChange={(o) => !o && setDel(null)}
        title={t('common.delete')}
        message={t('users.deleteConfirm', { name: del?.name_en ?? '' })}
        confirmLabel={t('common.delete')}
        busy={deleteM.isPending}
        onConfirm={() => del && deleteM.mutate(del.id)}
      />
    </div>
  );
}

function PlanForm({ draft, onClose, onSave, busy }: { draft: Draft; onClose: () => void; onSave: (d: Draft) => void; busy: boolean }) {
  const { t } = useTranslation();
  const [form, setForm] = useState<Draft>(draft);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setForm((f) => ({ ...f, [k]: v }));
  const isEdit = !!draft.id;

  return (
    <Modal
      open
      onOpenChange={(o) => !o && onClose()}
      title={isEdit ? t('common.edit') : t('plans.newPlan')}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
          <Button onClick={() => onSave(form)} disabled={busy}>{t('common.save')}</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Name (EN)"><Input value={form.name_en ?? ''} onChange={(e) => set('name_en', e.target.value)} /></Field>
        <Field label="الاسم (AR)"><Input dir="rtl" value={form.name_ar ?? ''} onChange={(e) => set('name_ar', e.target.value)} /></Field>
        <Field label="Description (EN)"><Input value={form.description_en ?? ''} onChange={(e) => set('description_en', e.target.value)} /></Field>
        <Field label="الوصف (AR)"><Input dir="rtl" value={form.description_ar ?? ''} onChange={(e) => set('description_ar', e.target.value)} /></Field>
        <Field label={`${t('common.price')} (AED)`}>
          <Input type="number" value={form.price ?? 0} onChange={(e) => set('price', Number(e.target.value))} />
        </Field>
        <Field label={t('plans.interval')}>
          <Select
            value={form.interval ?? 'monthly'}
            onValueChange={(v) => set('interval', v as PlanInterval)}
            options={[
              { value: 'monthly', label: 'monthly' },
              { value: 'quarterly', label: 'quarterly' },
              { value: 'yearly', label: 'yearly' },
            ]}
            className="w-full"
          />
        </Field>
        <Field label="Stripe Price ID"><Input value={form.stripe_price_id ?? ''} onChange={(e) => set('stripe_price_id', e.target.value)} placeholder="price_..." /></Field>
        <Field label="Sort order"><Input type="number" value={form.sort_order ?? 0} onChange={(e) => set('sort_order', Number(e.target.value))} /></Field>
        <div className="sm:col-span-2">
          <Field label={`${t('plans.features')} (EN)`}>
            <TagInput value={form.features_en ?? []} onChange={(v) => set('features_en', v)} placeholder="Add a feature…" />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label={`${t('plans.features')} (AR)`}>
            <TagInput value={form.features_ar ?? []} onChange={(v) => set('features_ar', v)} placeholder="أضف ميزة…" />
          </Field>
        </div>
        <label className="flex items-center gap-3 sm:col-span-2">
          <Switch checked={form.is_active ?? true} onCheckedChange={(v) => set('is_active', v)} />
          <span className="text-sm text-ink">{t('users.active')}</span>
        </label>
      </div>
    </Modal>
  );
}
