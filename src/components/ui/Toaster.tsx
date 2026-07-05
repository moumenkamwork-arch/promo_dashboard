import { Toaster as Sonner } from 'sonner';

export { toast } from 'sonner';

export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      toastOptions={{
        style: {
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-line)',
          color: 'var(--color-ink)',
          borderRadius: '12px',
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
        },
      }}
    />
  );
}
