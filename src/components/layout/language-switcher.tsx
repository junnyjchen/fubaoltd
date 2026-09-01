'use client';

import { Globe } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-context';
import { cn } from '@/lib/utils';

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();

  return (
    <div
      className={cn(
        'flex items-center gap-1 border border-border rounded-full p-0.5',
        className
      )}
      aria-label="Language"
    >
      <Globe className="w-3.5 h-3.5 text-muted-foreground ml-1.5" aria-hidden="true" />
      {(['en', 'zh'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          className={cn(
            'px-2 py-0.5 text-xs font-medium rounded-full transition-colors',
            locale === l
              ? 'bg-ink text-paper'
              : 'text-muted-foreground hover:text-ink'
          )}
        >
          {l === 'en' ? 'EN' : '中文'}
        </button>
      ))}
    </div>
  );
}
