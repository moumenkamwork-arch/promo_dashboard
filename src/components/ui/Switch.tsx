import * as RSwitch from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

export function Switch({
  checked,
  onCheckedChange,
  disabled,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <RSwitch.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={cn(
        'relative h-5 w-9 shrink-0 rounded-full border border-line transition-colors duration-200',
        'data-[state=checked]:bg-accent data-[state=unchecked]:bg-surface-3',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40',
      )}
    >
      <RSwitch.Thumb
        className={cn(
          'block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
          'data-[state=unchecked]:translate-x-0.5 data-[state=checked]:translate-x-[1.125rem]',
          'data-[state=checked]:bg-black rtl:data-[state=checked]:-translate-x-[1.125rem] rtl:data-[state=unchecked]:-translate-x-0.5',
        )}
      />
    </RSwitch.Root>
  );
}
