'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, Tag, Info, Check, CheckCheck, LogIn, Bell } from 'lucide-react';
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

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function NotificationsClient() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [loaded, setLoaded] = useState(false);

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

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [isLoading, user, router]);

  if (!isLoading && !user) return null;

  const markRead = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId: id }),
    }).catch(() => {});
    load();
  };

  const markAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAll: true }),
    }).catch(() => {});
    load();
  };

  return (
    <div className="bg-paper py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.4em] text-cinnabar">
            Inbox
          </p>
          <h1 className="font-serif text-4xl font-light tracking-wide text-ink sm:text-5xl">
            Notifications
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-smoke">
            Order updates, promotions, and news about your talismans.
          </p>
        </div>

        {isLoading || !loaded ? (
          <div className="border border-border bg-jade/40 px-8 py-16 text-center text-sm text-smoke">
            Loading…
          </div>
        ) : items.length === 0 ? (
          <div className="mx-auto flex max-w-sm flex-col items-center gap-4 border border-border bg-jade/40 px-8 py-16 text-center">
            <Bell className="h-6 w-6 text-smoke" strokeWidth={1.5} />
            <p className="text-sm text-smoke">
              No notifications yet. They will appear here when something
              happens with your orders or account.
            </p>
            <Link
              href="/talisman"
              className="border border-cinnabar bg-cinnabar px-6 py-2.5 text-xs tracking-[0.1em] text-white transition-colors duration-300 hover:bg-cinnabar/90"
            >
              Browse Talismans
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs text-smoke">
                {unread > 0
                  ? `${unread} unread notification${unread === 1 ? '' : 's'}`
                  : 'All caught up'}
              </p>
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1.5 text-xs text-smoke transition-colors hover:text-cinnabar"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all as read
                </button>
              )}
            </div>

            <div className="border border-border">
              {items.map((n) => {
                const Icon = TYPE_ICON[n.type] ?? Info;
                const row = (
                  <div
                    className={`flex items-start gap-4 border-b border-border/50 px-5 py-4 transition-colors duration-200 last:border-b-0 ${
                      n.read ? '' : 'bg-jade/40'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center border ${
                        n.read
                          ? 'border-border text-smoke'
                          : 'border-cinnabar/30 text-cinnabar'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-ink">
                          {n.title}
                        </h3>
                        {!n.read && (
                          <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cinnabar" />
                        )}
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-smoke">
                        {n.message}
                      </p>
                      <p className="mt-1.5 text-[11px] text-smoke/60">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                    {!n.read && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          markRead(n.id);
                        }}
                        className="mt-1 flex flex-shrink-0 items-center gap-1 border border-border px-2.5 py-1.5 text-[11px] text-smoke transition-colors hover:border-cinnabar hover:text-cinnabar"
                        aria-label={`Mark "${n.title}" as read`}
                      >
                        <Check className="h-3 w-3" />
                        Mark read
                      </button>
                    )}
                  </div>
                );
                return n.link ? (
                  <Link key={n.id} href={n.link}>
                    {row}
                  </Link>
                ) : (
                  <div key={n.id}>{row}</div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
