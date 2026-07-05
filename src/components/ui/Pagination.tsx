import { useTranslation } from 'react-i18next';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { Button } from './Button';
import { formatNumber } from '@/lib/format';

export function Pagination({
  page,
  totalPages,
  total,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const { t } = useTranslation();
  const isRtl = document.documentElement.dir === 'rtl';
  const Prev = isRtl ? CaretRight : CaretLeft;
  const Next = isRtl ? CaretLeft : CaretRight;

  return (
    <div className="flex items-center justify-between gap-3 px-1 pt-4 text-sm text-ink-muted">
      <span className="text-xs">{t('common.rowsTotal', { count: total })}</span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label={t('common.prev')}
        >
          <Prev size={14} />
        </Button>
        <span className="min-w-[5.5rem] text-center text-xs tabular-nums">
          {t('common.page')} {page} {t('common.of')} {Math.max(totalPages, 1)}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label={t('common.next')}
        >
          <Next size={14} />
        </Button>
      </div>
    </div>
  );
}

export { formatNumber };
