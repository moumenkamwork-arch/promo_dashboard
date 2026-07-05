import { useTranslation } from 'react-i18next';
import { Badge, type Tone } from './Badge';

const toneByStatus: Record<string, Tone> = {
  active: 'ok',
  succeeded: 'ok',
  resolved: 'ok',
  completed: 'ok',
  pending: 'warn',
  reviewed: 'info',
  draft: 'neutral',
  paused: 'neutral',
  expired: 'neutral',
  dismissed: 'neutral',
  refunded: 'info',
  rejected: 'danger',
  failed: 'danger',
};

export function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  const tone = toneByStatus[status] ?? 'neutral';
  return (
    <Badge tone={tone}>
      <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {t(`status.${status}`, status)}
    </Badge>
  );
}
