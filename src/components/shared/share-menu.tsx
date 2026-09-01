'use client';

import { useEffect, useState } from 'react';
import {
  Share2,
  Link2,
  Check,
  Mail,
  Send,
  Facebook,
  Twitter,
  MessageCircle,
  Smartphone,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface ShareTarget {
  key: string;
  label: string;
  icon: React.ReactNode;
  href: (url: string, text: string) => string;
}

const TARGETS: ShareTarget[] = [
  {
    key: 'x',
    label: 'Share on X',
    icon: <Twitter className="h-4 w-4" />,
    href: (url, text) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    key: 'facebook',
    label: 'Share on Facebook',
    icon: <Facebook className="h-4 w-4" />,
    href: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    key: 'whatsapp',
    label: 'Share on WhatsApp',
    icon: <MessageCircle className="h-4 w-4" />,
    href: (url, text) =>
      `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
  },
  {
    key: 'telegram',
    label: 'Share on Telegram',
    icon: <Send className="h-4 w-4" />,
    href: (url, text) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    key: 'email',
    label: 'Share via Email',
    icon: <Mail className="h-4 w-4" />,
    href: (url, text) =>
      `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`,
  },
];

interface Props {
  /** Page-relative path to share, e.g. "/talisman/protection-talisman". */
  path: string;
  /** Share text — product/tagline or article title. */
  title: string;
  /** Extra context appended to the share text. */
  subtitle?: string;
  /** 'button' renders a bordered site-style button; 'icon' a bare icon button. */
  variant?: 'button' | 'icon';
  label?: string;
}

export function ShareMenu({
  path,
  title,
  subtitle,
  variant = 'button',
  label = 'Share',
}: Props) {
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setUrl(`${window.location.origin}${path}`);
    setCanNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
  }, [path]);

  const shareText = subtitle ? `${title} — ${subtitle}` : title;

  const openPopup = (href: string) => {
    window.open(href, '_blank', 'noopener,noreferrer,width=640,height=540');
  };

  const copyLink = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nativeShare = async () => {
    if (!url) return;
    try {
      await navigator.share({ title, text: shareText, url });
    } catch {
      /* user dismissed the sheet */
    }
  };

  const triggerClass =
    variant === 'icon'
      ? 'flex h-8 w-8 items-center justify-center text-smoke transition-all duration-300 hover:text-cinnabar'
      : 'flex w-full items-center justify-center gap-2 border border-border py-3 text-xs tracking-[0.1em] text-smoke transition-all duration-300 hover:border-cinnabar hover:text-cinnabar';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Share ${title}`}
        className={triggerClass}
      >
        <Share2 className="h-4 w-4" />
        {variant === 'button' && label}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 border-border bg-paper">
        {canNativeShare && (
          <>
            <DropdownMenuItem
              onClick={nativeShare}
              className="gap-3 text-ink focus:bg-jade focus:text-ink"
            >
              <Smartphone className="h-4 w-4 text-cinnabar" />
              More sharing options
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
          </>
        )}
        {TARGETS.map((target) => (
          <DropdownMenuItem
            key={target.key}
            disabled={!url}
            onClick={() => url && openPopup(target.href(url, shareText))}
            className="gap-3 text-ink focus:bg-jade focus:text-ink"
          >
            <span className="text-smoke">{target.icon}</span>
            {target.label.replace('Share on ', '').replace('Share via ', '')}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem
          disabled={!url}
          onClick={copyLink}
          className="gap-3 text-ink focus:bg-jade focus:text-ink"
        >
          {copied ? (
            <Check className="h-4 w-4 text-cinnabar" />
          ) : (
            <Link2 className="h-4 w-4 text-smoke" />
          )}
          {copied ? 'Link copied' : 'Copy link'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
