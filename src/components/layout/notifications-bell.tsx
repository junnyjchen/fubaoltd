'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, Package, Tag, Info, Check } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';

interface NotificationItem {
  id: string;
  type: 'order' | 'promotion' | 'system';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

const TYPE_ICON = {
  order: Package,
  promotion: Tag,
  system: Info,
} as const;

export function NotificationsBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    fetch('/api/notifications')
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => {
        if (d?.data) {
          setItems(d.data.notifications ?? []);
          setUnread(d.data.unreadCount ?? 0);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  if (!user) return null;

  const markAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAll: true }),
    }).catch(() => {});
    load();
  };

  const recent = items.slice(0, 5);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => {
          setOpen((v) => !v);
          if (!open && !loaded) load();
        }}
        className="relative text-ink transition-colors duration-300 hover:text-cinnabar"
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ''}`}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-cinnabar px-1 text-[10px] font-medium text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-50 w-80 border border-border bg-paper shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-xs font-medium uppercase tracking-[0.15em] text-ink">
              Notifications
            </span>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-[11px] text-smoke transition-colors hover:text-cinnabar"
              >
                <Check className="h-3 w-3" />
                Mark all read
              </button>
            )}
          </div>

          {recent.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs text-smoke">
              No notifications yet.
            </p>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {recent.map((n) => {
                const Icon = TYPE_ICON[n.type] ?? Info;
                const inner = (
                  <div
                    className={`flex gap-3 border-b border-border/50 px-4 py-3 transition-colors duration-200 ${
                      n.read ? '' : 'bg-jade/40'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center border ${
                        n.read
                          ? 'border-border text-smoke'
                          : 'border-cinnabar/30 text-cinnabar'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-xs font-medium text-ink">
                        {n.title}
                        {!n.read && (
                          <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cinnabar" />
                        )}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-smoke">
                        {n.message}
                      </p>
                    </div>
                  </div>
                );
                return n.link ? (
                  <Link key={n.id} href={n.link} onClick={() => setOpen(false)}>
                    {inner}
                  </Link>
                ) : (
                  <div key={n.id}>{inner}</div>
                );
              })}
            </div>
          )}

          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-border px-4 py-2.5 text-center text-[11px] tracking-wide text-cinnabar transition-colors hover:text-ink"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
