'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Search, X } from 'lucide-react';

export function SearchBox() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeQuery = searchParams.get('q') ?? '';
  const [value, setValue] = useState(activeQuery);

  // Keep local input in sync when the URL changes (pill clicks, back nav)
  useEffect(() => {
    setValue(searchParams.get('q') ?? '');
  }, [searchParams]);

  const pushSearch = (q: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (q.trim()) {
      params.set('q', q.trim());
    } else {
      params.delete('q');
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div className="relative mx-auto w-full max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-smoke" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') pushSearch(value);
        }}
        placeholder="Search talismans..."
        aria-label="Search talismans"
        className="w-full border border-border bg-transparent py-2.5 pl-9 pr-9 text-sm text-ink placeholder:text-smoke/50 focus:border-cinnabar focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            setValue('');
            if (activeQuery) pushSearch('');
          }}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-smoke transition-colors hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
