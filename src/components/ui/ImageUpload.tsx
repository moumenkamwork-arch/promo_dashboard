import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UploadSimple, ArrowsClockwise, Trash, CircleNotch, LinkSimple } from '@phosphor-icons/react';
import { api, errorMessage } from '@/lib/api';
import { toast } from '@/components/ui/Toaster';
import { cn } from '@/lib/utils';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB — matches the backend image limit

interface UploadedMedia {
  id: string;
  file_url: string;
}

/**
 * Brand image picker. The admin selects a local file; it is uploaded through the
 * backend (`POST /upload/image` → Supabase Storage + `media` record) and the
 * returned public `file_url` is stored via onChange. The URL itself is shown
 * read-only — it is the canonical storage link and must never be hand-edited.
 */
export function ImageUpload({
  value,
  onChange,
  bucket = 'general',
  relatedTo,
  className,
}: {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  bucket?: string;
  relatedTo?: string;
  className?: string;
}) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const pick = () => inputRef.current?.click();

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error(t('upload.invalidType'));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error(t('upload.maxSize'));
      return;
    }

    const fd = new FormData();
    fd.append('file', file);
    fd.append('bucket', bucket);
    if (relatedTo) fd.append('related_to', relatedTo);

    setUploading(true);
    try {
      const res = await api.post<{ data: UploadedMedia }>('/upload/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(res.data.data.file_url);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setUploading(false);
      // allow re-selecting the same file
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />

      {uploading ? (
        <div className="flex h-24 items-center justify-center gap-2 rounded-md border border-dashed border-line bg-surface-2 text-sm text-ink-muted">
          <CircleNotch size={18} className="animate-spin text-accent" />
          {t('upload.uploading')}
        </div>
      ) : value ? (
        <div className="flex items-center gap-3 rounded-md border border-line bg-surface-2 p-2.5">
          <img src={value} alt="" className="h-14 w-14 shrink-0 rounded-md bg-surface-3 object-cover" />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 text-xs text-ink-faint">
              <LinkSimple size={12} className="shrink-0" />
              <span className="truncate font-mono" dir="ltr" title={value}>
                {value}
              </span>
            </p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={pick}
                className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-xs text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
              >
                <ArrowsClockwise size={12} /> {t('upload.replace')}
              </button>
              <button
                type="button"
                onClick={() => onChange(null)}
                className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-xs text-danger transition-colors hover:bg-danger-soft"
              >
                <Trash size={12} /> {t('upload.remove')}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={pick}
          className={cn(
            'flex h-24 w-full flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-line bg-surface-2',
            'text-sm text-ink-muted transition-colors hover:border-accent hover:text-ink',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent',
          )}
        >
          <UploadSimple size={20} className="text-accent" />
          {t('upload.image')}
          <span className="text-[11px] text-ink-faint">{t('upload.hint')}</span>
        </button>
      )}
    </div>
  );
}
