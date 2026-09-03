'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Copy,
  History,
  Loader2,
  Lock,
  Wallet as WalletIcon,
} from 'lucide-react';
import { NETWORK_CONFIG } from '@/lib/crypto/types';
import type { CryptoNetwork, CryptoToken } from '@/lib/crypto/types';

interface Payment {
  id: string;
  orderId: string;
  userId: string;
  token: CryptoToken;
  network: CryptoNetwork;
  amount: number;
  status: 'pending' | 'awaiting_payment' | 'confirming' | 'completed' | 'expired' | 'failed';
  txHash?: string;
  createdAt: string;
}

interface Balance {
  USD: number;
  USDT: number;
  USDC: number;
  totalUSD: number;
}

interface DepositTicket {
  orderId: string;
  address: string;
  token: string;
  network: CryptoNetwork;
  amount: number;
}

const TOKENS: CryptoToken[] = ['USDT', 'USDC'];
const NETWORKS: CryptoNetwork[] = ['TRC20', 'ERC20', 'BEP20'];
const TOPUP_PRESETS = [10, 25, 50, 100];

const STATUS_LABEL: Record<Payment['status'], string> = {
  pending: 'Pending',
  awaiting_payment: 'Awaiting Payment',
  confirming: 'Confirming',
  completed: 'Completed',
  expired: 'Expired',
  failed: 'Failed',
};

const STATUS_COLOR: Record<Payment['status'], string> = {
  pending: 'text-smoke',
  awaiting_payment: 'text-gold',
  confirming: 'text-gold',
  completed: 'text-cinnabar',
  expired: 'text-smoke',
  failed: 'text-red-600',
};

export default function WalletClient() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [balance, setBalance] = useState<Balance>({ USD: 0, USDT: 0, USDC: 0, totalUSD: 0 });
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // Top-up dialog
  const [topupOpen, setTopupOpen] = useState(false);
  const [topupToken, setTopupToken] = useState<CryptoToken>('USDT');
  const [topupNetwork, setTopupNetwork] = useState<CryptoNetwork>('TRC20');
  const [topupAmount, setTopupAmount] = useState<string>('25');
  const [ticket, setTicket] = useState<DepositTicket | null>(null);
  const [txHash, setTxHash] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Withdraw dialog
  const [wdOpen, setWdOpen] = useState(false);
  const [wdToken, setWdToken] = useState<CryptoToken>('USDT');
  const [wdNetwork, setWdNetwork] = useState<CryptoNetwork>('TRC20');
  const [wdAmount, setWdAmount] = useState<string>('');
  const [wdAddress, setWdAddress] = useState('');
  const [wdSubmitting, setWdSubmitting] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [balRes, histRes] = await Promise.all([
        fetch('/api/wallet/balance'),
        fetch('/api/wallet/history'),
      ]);
      if (balRes.ok) {
        const json = await balRes.json();
        setBalance(json.data);
      }
      if (histRes.ok) {
        const json = await histRes.json();
        setPayments(json.data.payments);
      }
    } catch {
      // network hiccup — keep last known state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login?redirect=/wallet');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (user) {
      refresh();
    }
  }, [user, refresh]);

  // Poll pending deposit status while a ticket is open
  useEffect(() => {
    if (!ticket) {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }
    pollRef.current = setInterval(refresh, 5000);
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [ticket, refresh]);

  const startTopup = async () => {
    const amount = parseFloat(topupAmount);
    if (!amount || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    setSubmitting(true);
    try {
      const orderId = `WALLET-${Date.now().toString(36).toUpperCase()}`;
      const res = await fetch('/api/crypto/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          amount,
          token: topupToken,
          network: topupNetwork,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || 'Failed to create deposit ticket');
        return;
      }
      setTicket({
        orderId: json.data.orderId,
        address: json.data.recipientAddress,
        token: json.data.token,
        network: json.data.network,
        amount: json.data.amount,
      });
      setTxHash('');
      toast.success('Deposit address ready — send funds, then confirm below');
      refresh();
    } catch {
      toast.error('Network error, please retry');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeposit = async () => {
    if (!ticket) return;
    if (!txHash.trim()) {
      toast.error('Paste your transaction hash first');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/crypto/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: ticket.orderId,
          txHash: txHash.trim(),
          network: ticket.network,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || 'Verification failed');
        return;
      }
      toast.success('Deposit confirmed — balance updated');
      setTicket(null);
      setTopupOpen(false);
      refresh();
    } catch {
      toast.error('Network error, please retry');
    } finally {
      setSubmitting(false);
    }
  };

  const submitWithdraw = async () => {
    const amount = parseFloat(wdAmount);
    if (!amount || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    if (amount > (balance[wdToken] || 0)) {
      toast.error(`Amount exceeds your ${wdToken} balance`);
      return;
    }
    if (!wdAddress.trim()) {
      toast.error('Enter your withdrawal address');
      return;
    }
    setWdSubmitting(true);
    try {
      const res = await fetch('/api/crypto/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: wdToken,
          network: wdNetwork,
          amount,
          toAddress: wdAddress.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || 'Withdrawal failed');
        return;
      }
      toast.success(json.data.message || 'Withdrawal submitted');
      setWdOpen(false);
      setWdAmount('');
      setWdAddress('');
      refresh();
    } catch {
      toast.error('Network error, please retry');
    } finally {
      setWdSubmitting(false);
    }
  };

  const copyAddress = async () => {
    if (!ticket) return;
    try {
      await navigator.clipboard.writeText(ticket.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Copy failed — select the address manually');
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-smoke" />
      </div>
    );
  }

  const txPlaceholder =
    ticket?.network === 'TRC20' ? '64-char hex, no 0x prefix' : '0x followed by 64 hex chars';
  const addrPlaceholder = wdNetwork === 'TRC20' ? 'T… (34 chars)' : '0x…';

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="font-serif text-4xl font-light tracking-widest text-ink">
          Crypto Wallet
        </h1>
        <p className="mt-3 text-sm text-smoke">
          Deposit with USDT / USDC to pay for talismans — for entertainment
          purposes only.
        </p>
      </div>

      {/* Balance card */}
      <section className="mb-10 rounded-lg border border-gold/30 bg-jade/60 p-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-smoke">
              Available Balance
            </p>
            <p className="mt-2 font-serif text-5xl font-light text-ink">
              ${balance.totalUSD.toFixed(2)}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(['USD', 'USDT', 'USDC'] as const).map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-gold/30 bg-paper px-3 py-1 text-xs text-smoke"
                >
                  {t} {(balance[t] || 0).toFixed(2)}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => {
                setTicket(null);
                setTopupOpen(true);
              }}
              className="bg-cinnabar text-paper hover:bg-cinnabar/90"
            >
              <ArrowDownToLine className="mr-2 h-4 w-4" />
              Deposit
            </Button>
            <Button
              variant="outline"
              onClick={() => setWdOpen(true)}
              className="border-gold/40 text-ink hover:bg-jade"
            >
              <ArrowUpFromLine className="mr-2 h-4 w-4" />
              Withdraw
            </Button>
          </div>
        </div>
      </section>

      {/* History */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 font-serif text-2xl font-light text-ink">
          <History className="h-5 w-5 text-gold" />
          Transaction History
        </h2>
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-smoke" />
          </div>
        ) : payments.length === 0 ? (
          <div className="rounded-lg border border-gold/20 bg-jade/40 py-12 text-center">
            <WalletIcon className="mx-auto mb-3 h-8 w-8 text-smoke" />
            <p className="text-sm text-smoke">
              No transactions yet. Deposit to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gold/20">
            <table className="w-full text-sm">
              <thead className="bg-jade/70 text-left text-xs uppercase tracking-wider text-smoke">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Token</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t border-gold/10 bg-paper hover:bg-jade/30"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-smoke">
                      {new Date(p.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ink">
                      {p.orderId}
                    </td>
                    <td className="px-4 py-3 text-ink">{p.token}</td>
                    <td className="px-4 py-3 text-right font-medium text-ink">
                      {p.amount.toFixed(2)} {p.token}
                    </td>
                    <td className={`px-4 py-3 ${STATUS_COLOR[p.status]}`}>
                      {STATUS_LABEL[p.status]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Top-up dialog */}
      <Dialog open={topupOpen} onOpenChange={(open) => {
        setTopupOpen(open);
        if (!open) setTicket(null);
      }}>
        <DialogContent className="max-w-lg border-gold/30 bg-paper sm:max-w-md">
          {!ticket ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl font-light text-ink">
                  Deposit Funds
                </DialogTitle>
                <DialogDescription className="text-smoke">
                  Choose a token, network, and amount. We&apos;ll show a deposit
                  address.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-5 py-2">
                <div>
                  <Label className="text-sm text-ink">Token</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {TOKENS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTopupToken(t)}
                        className={`rounded-md border px-4 py-2.5 text-sm transition-colors ${
                          topupToken === t
                            ? 'border-cinnabar bg-cinnabar/10 text-cinnabar'
                            : 'border-gold/30 bg-jade/40 text-ink hover:border-gold/60'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-ink">Network</Label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {NETWORKS.map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setTopupNetwork(n)}
                        className={`rounded-md border px-2 py-2 text-sm transition-colors ${
                          topupNetwork === n
                            ? 'border-cinnabar bg-cinnabar/10 text-cinnabar'
                            : 'border-gold/30 bg-jade/40 text-ink hover:border-gold/60'
                        }`}
                      >
                        {n}
                        <span className="mt-0.5 block text-[10px] text-smoke">
                          fee {NETWORK_CONFIG[n].fee}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-ink">Amount (USD)</Label>
                  <div className="mt-2 flex gap-2">
                    {TOPUP_PRESETS.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setTopupAmount(String(v))}
                        className={`flex-1 rounded-md border px-2 py-2 text-sm transition-colors ${
                          topupAmount === String(v)
                            ? 'border-cinnabar bg-cinnabar/10 text-cinnabar'
                            : 'border-gold/30 bg-jade/40 text-ink hover:border-gold/60'
                        }`}
                      >
                        ${v}
                      </button>
                    ))}
                  </div>
                  <Input
                    type="number"
                    min="1"
                    step="0.01"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    className="mt-3 border-gold/30 bg-paper text-ink"
                    placeholder="Custom amount"
                  />
                </div>
                <Button
                  onClick={startTopup}
                  disabled={submitting}
                  className="w-full bg-cinnabar text-paper hover:bg-cinnabar/90"
                >
                  {submitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowDownToLine className="mr-2 h-4 w-4" />
                  )}
                  Get Deposit Address
                </Button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl font-light text-ink">
                  Send {ticket.token}
                </DialogTitle>
                <DialogDescription className="text-smoke">
                  Network: {ticket.network}. Send exactly{' '}
                  <span className="font-medium text-cinnabar">
                    {ticket.amount} {ticket.token}
                  </span>{' '}
                  to the address below.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="rounded-md border border-gold/30 bg-jade/50 p-4">
                  <p className="mb-2 text-xs uppercase tracking-wider text-smoke">
                    Deposit Address
                  </p>
                  <div className="flex items-start justify-between gap-2">
                    <code className="break-all text-xs text-ink">
                      {ticket.address}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copyAddress}
                      className="shrink-0 border-gold/40 text-ink hover:bg-jade"
                    >
                      <Copy className="mr-1 h-3 w-3" />
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-ink">
                    Transaction Hash (after sending)
                  </Label>
                  <Input
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    placeholder={txPlaceholder}
                    className="mt-2 border-gold/30 bg-paper font-mono text-xs text-ink"
                  />
                </div>
                <Button
                  onClick={confirmDeposit}
                  disabled={submitting}
                  className="w-full bg-cinnabar text-paper hover:bg-cinnabar/90"
                >
                  {submitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="mr-2 h-4 w-4" />
                  )}
                  Confirm Deposit
                </Button>
                <p className="text-center text-xs text-smoke">
                  Order {ticket.orderId} — verifying credits your balance
                  automatically.
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Withdraw dialog */}
      <Dialog open={wdOpen} onOpenChange={setWdOpen}>
        <DialogContent className="max-w-lg border-gold/30 bg-paper sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-light text-ink">
              Withdraw Funds
            </DialogTitle>
            <DialogDescription className="text-smoke">
              Send your balance to an external address on your chosen network.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div>
              <Label className="text-sm text-ink">Token</Label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {TOKENS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setWdToken(t)}
                    className={`rounded-md border px-4 py-2.5 text-sm transition-colors ${
                      wdToken === t
                        ? 'border-cinnabar bg-cinnabar/10 text-cinnabar'
                        : 'border-gold/30 bg-jade/40 text-ink hover:border-gold/60'
                    }`}
                  >
                    {t}
                    <span className="mt-0.5 block text-[10px] text-smoke">
                      {(balance[t] || 0).toFixed(2)} available
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm text-ink">Network</Label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {NETWORKS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setWdNetwork(n)}
                    className={`rounded-md border px-2 py-2 text-sm transition-colors ${
                      wdNetwork === n
                        ? 'border-cinnabar bg-cinnabar/10 text-cinnabar'
                        : 'border-gold/30 bg-jade/40 text-ink hover:border-gold/60'
                    }`}
                  >
                    {n}
                    <span className="mt-0.5 block text-[10px] text-smoke">
                      fee {NETWORK_CONFIG[n].fee}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm text-ink">Amount</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={wdAmount}
                onChange={(e) => setWdAmount(e.target.value)}
                className="mt-2 border-gold/30 bg-paper text-ink"
                placeholder={`Up to ${(balance[wdToken] || 0).toFixed(2)} ${wdToken}`}
              />
            </div>
            <div>
              <Label className="text-sm text-ink">
                Withdrawal Address ({wdNetwork})
              </Label>
              <Input
                value={wdAddress}
                onChange={(e) => setWdAddress(e.target.value)}
                className="mt-2 border-gold/30 bg-paper font-mono text-xs text-ink"
                placeholder={addrPlaceholder}
              />
            </div>
            <Button
              onClick={submitWithdraw}
              disabled={wdSubmitting}
              className="w-full bg-cinnabar text-paper hover:bg-cinnabar/90"
            >
              {wdSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowUpFromLine className="mr-2 h-4 w-4" />
              )}
              Submit Withdrawal
            </Button>
            <p className="flex items-center justify-center gap-1 text-center text-xs text-smoke">
              <Lock className="h-3 w-3" />
              Demo environment — no real funds move
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
