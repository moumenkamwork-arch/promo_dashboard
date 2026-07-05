import { useState, type KeyboardEvent } from 'react';
import { X } from '@phosphor-icons/react';

export function TagInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const v = draft.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setDraft('');
  };
  const remove = (tag: string) => onChange(value.filter((t) => t !== tag));

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add();
    } else if (e.key === 'Backspace' && !draft && value.length) {
      remove(value[value.length - 1]);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-line bg-surface-2 p-2 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent">
      {value.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-surface-3 px-2 py-0.5 text-xs text-ink">
          {tag}
          <button type="button" onClick={() => remove(tag)} className="text-ink-faint hover:text-ink">
            <X size={11} />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={add}
        placeholder={value.length ? '' : placeholder}
        className="min-w-[6rem] flex-1 bg-transparent px-1 text-sm text-ink placeholder:text-ink-faint focus:outline-none"
      />
    </div>
  );
}
