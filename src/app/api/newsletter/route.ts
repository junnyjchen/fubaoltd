import { NextRequest, NextResponse } from 'next/server';
import { isValidEmail, subscribeNewsletter } from '@/lib/newsletter/newsletter-store';

// POST /api/newsletter — public newsletter subscribe.
// Body: { email: string }
// 200 first subscribe · 409 already subscribed · 400 invalid/missing email
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const email = typeof (body as { email?: unknown })?.email === 'string'
    ? ((body as { email: string }).email ?? '').trim()
    : '';

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
  }

  const sub = subscribeNewsletter(email);
  if (!sub) {
    return NextResponse.json(
      { error: 'This email is already subscribed' },
      { status: 409 }
    );
  }

  return NextResponse.json({
    success: true,
    data: { email: sub.email, subscribedAt: sub.createdAt },
  });
}
