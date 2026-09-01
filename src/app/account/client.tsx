'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function AccountPageClient() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/account');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  const levelColors: Record<string, string> = {
    bronze: 'bg-amber-700/10 text-amber-700',
    silver: 'bg-gray-400/10 text-gray-500',
    gold: 'bg-yellow-500/10 text-yellow-600',
    platinum: 'bg-purple-500/10 text-purple-600',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="font-serif text-3xl text-foreground mb-8">My Account</h1>

      {/* Profile Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 bg-card border border-border rounded-lg p-6">
          <h2 className="font-serif text-xl text-foreground mb-4">Profile</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="text-foreground">{user.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="text-foreground">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role</span>
              <span className="text-foreground capitalize">{user.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Member Since</span>
              <span className="text-foreground">{new Date().getFullYear()}</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 ${levelColors[user.level] || levelColors.bronze}`}>
            {user.level.charAt(0).toUpperCase() + user.level.slice(1)} Member
          </div>
          <div className="text-3xl font-bold text-foreground mt-2">{user.points}</div>
          <div className="text-sm text-muted-foreground">Points</div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-foreground">0</div>
          <div className="text-sm text-muted-foreground">Orders</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-foreground">0</div>
          <div className="text-sm text-muted-foreground">Favorites</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-foreground">${user.walletBalance.toFixed(2)}</div>
          <div className="text-sm text-muted-foreground">Wallet</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-foreground text-accent">{user.referralCode}</div>
          <div className="text-sm text-muted-foreground">Referral Code</div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="font-serif text-xl text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="p-3 border border-border rounded-md text-sm text-foreground hover:bg-muted transition-colors text-left">
            <span className="block font-medium">Orders</span>
            <span className="text-xs text-muted-foreground">View order history</span>
          </button>
          <button className="p-3 border border-border rounded-md text-sm text-foreground hover:bg-muted transition-colors text-left">
            <span className="block font-medium">Favorites</span>
            <span className="text-xs text-muted-foreground">Saved items</span>
          </button>
          <button className="p-3 border border-border rounded-md text-sm text-foreground hover:bg-muted transition-colors text-left">
            <span className="block font-medium">Wallet</span>
            <span className="text-xs text-muted-foreground">Balance & top-up</span>
          </button>
          <button className="p-3 border border-border rounded-md text-sm text-foreground hover:bg-muted transition-colors text-left">
            <span className="block font-medium">Referrals</span>
            <span className="text-xs text-muted-foreground">Invite & earn</span>
          </button>
        </div>
      </div>

      {/* Logout */}
      <div className="mt-8 text-center">
        <button
          onClick={async () => { await logout(); router.push('/'); }}
          className="px-6 py-2 border border-border rounded-md text-sm text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
