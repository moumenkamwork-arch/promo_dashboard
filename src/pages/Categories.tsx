import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Plus, PencilSimple, Trash, Tag } from '@phosphor-icons/react';
import { api, getData, errorMessage } from '@/lib/api';
import type { Category } from '@/types/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Field, Input } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/Toaster';
import { slugify } from '@/lib/format';

type Draft = Partial<Category>;

export default function Categories() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Draft | null>(null);
  const [del, setDel] = useState<Category | null>(null);

  const catsQ = useQuery({ queryKey: ['categories'], queryFn: () => getData<Category[]>('/categories') });
  const cats = catsQ.data ?? [];

  const saveM = useMutation({
    mutationFn: (d: Draft) => (d.id ? api.put(`/admin/categories/${d.id}`, d) : api.post('/admin/categories', d)),
    onSuccess: () => {
      toast.success(t('common.save'));
      qc.invalidateQueries({ queryKey: ['categories'] });
      setEditing(null);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const deleteM = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/categories/${id}`),
    onSuccess: () => {
      toast.success(t('common.delete'));
      qc.invalidateQueries({ queryKey: ['categories'] });
      setDel(null);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={t('categories.title')}
        subtitle={t('categories.subtitle')}
        actions={
          <Button onClick={() => setEditing({ name_en: '', name_ar: '', slug: '', icon_url: '', sort_order: 0 })}>
            <Plus size={16} weight="bold" /> {t('categories.newCategory')}
          </Button>
        }
      />

      {catsQ.isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : cats.length ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cats.map((c) => (
            <Card key={c.id} className="group flex items-center justify-between gap-3 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-3 text-accent">
                  {c.icon_url ? <img src={c.icon_url} alt="" className="h-5 w-5" /> : <Tag size={18} />}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{c.name_en}</p>
                  <p className="truncate text-xs text-ink-faint">
                    <span dir="rtl">{c.name_ar}</span> · <span className="font-mono">{c.slug}</span>
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button variant="ghost" size="icon" onClick={() => setEditing(c)} aria-label={t('common.edit')}>
                  <PencilSimple size={16} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDel(c)} aria-label={t('common.delete')}>
                  <Trash size={16} className="text-danger" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon={<Tag size={22} />} title={t('common.noResults')} />
      )}

      {editing ? <CategoryForm draft={editing} onClose={() => setEditing(null)} onSave={(d) => saveM.mutate(d)} busy={saveM.isPending} /> : null}

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

function CategoryForm({ draft, onClose, onSave, busy }: { draft: Draft; onClose: () => void; onSave: (d: Draft) => void; busy: boolean }) {
  const { t } = useTranslation();
  const [form, setForm] = useState<Draft>(draft);
  const [slugTouched, setSlugTouched] = useState(!!draft.id);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Modal
      open
      onOpenChange={(o) => !o && onClose()}
      title={draft.id ? t('common.edit') : t('categories.newCategory')}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
          <Button
            onClick={() => {
              // Omit empty optional fields — the backend validates icon_url as an
              // optional URL, and an empty string fails .url() (optional allows undefined, not "").
              const payload: Draft = { ...form };
              if (!payload.icon_url) delete payload.icon_url;
              onSave(payload);
            }}
            disabled={busy}
          >
            {t('common.save')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Name (EN)">
            <Input
              value={form.name_en ?? ''}
              onChange={(e) => {
                set('name_en', e.target.value);
                if (!slugTouched) set('slug', slugify(e.target.value));
              }}
            />
          </Field>
          <Field label="الاسم (AR)"><Input dir="rtl" value={form.name_ar ?? ''} onChange={(e) => set('name_ar', e.target.value)} /></Field>
        </div>
        <Field label="Slug" hint="auto-generated from the English name">
          <Input
            value={form.slug ?? ''}
            onChange={(e) => {
              setSlugTouched(true);
              set('slug', slugify(e.target.value));
            }}
            className="font-mono"
          />
        </Field>
        <Field label="Icon">
          {/* Icon is uploaded through the backend upload API — the returned
              storage URL is stored as-is (read-only), never typed by hand. */}
          <ImageUpload
            value={form.icon_url}
            onChange={(url) => set('icon_url', url ?? '')}
            bucket="general"
          />
        </Field>
        <Field label="Sort order"><Input type="number" value={form.sort_order ?? 0} onChange={(e) => set('sort_order', Number(e.target.value))} /></Field>
      </div>
    </Modal>
  );
}
