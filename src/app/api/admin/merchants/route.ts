/**
 * Admin console — Merchant applications & withdrawal approvals.
 *
 * GET   → applications (enriched with applicant email) + withdrawals + stats
 * POST  → { action: 'review_application', applicationId, decision: 'approve'|'reject' }
 *       | { action: 'review_withdrawal', withdrawalId, decision: 'approve'|'reject' }
 *
 * Approving an application provisions a Merchant record (shop appears in
 * /artisans + merchant portal access); rejecting a withdrawal releases held
 * funds back to the merchant balance. Admin role required.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import { getUserById } from '@/lib/auth/user-store';
import {
  merchantApplications,
  merchantWithdrawals,
  reviewMerchantApplication,
  reviewMerchantWithdrawal,
} from '@/lib/merchant/merchant-store';

function authError(error: unknown): NextResponse | null {
  const message = error instanceof Error ? error.message : '';
  if (message === 'Forbidden') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }
  if (message === 'Unauthorized') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function GET() {
  try {
    await requireRole('admin');
  } catch (error) {
    const mapped = authError(error);
    if (mapped) return mapped;
    throw error;
  }

  // Enrich applications with the linked account email for display
  const enrichedApplications = await Promise.all(
    merchantApplications.map(async (app) => {
      const user = app.userId ? await getUserById(app.userId) : null;
      return { ...app, userEmail: user?.email ?? null, userName: user?.name ?? null };
    })
  );

  return NextResponse.json({
    success: true,
    data: {
      applications: enrichedApplications,
      withdrawals: merchantWithdrawals,
      stats: {
        pendingApplications: merchantApplications.filter((a) => a.status === 'pending').length,
        approvedApplications: merchantApplications.filter((a) => a.status === 'approved').length,
        rejectedApplications: merchantApplications.filter((a) => a.status === 'rejected').length,
        pendingWithdrawals: merchantWithdrawals.filter((w) => w.status === 'pending').length,
        pendingWithdrawalAmount: Number(
          merchantWithdrawals
            .filter((w) => w.status === 'pending')
            .reduce((sum, w) => sum + w.amount, 0)
            .toFixed(2)
        ),
      },
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    await requireRole('admin');
  } catch (error) {
    const mapped = authError(error);
    if (mapped) return mapped;
    throw error;
  }

  try {
    const body = await request.json();
    const action = String(body.action ?? '');
    const decision = String(body.decision ?? '');

    if (decision !== 'approve' && decision !== 'reject') {
      return NextResponse.json({ success: false, error: "decision must be 'approve' or 'reject'" }, { status: 400 });
    }
    const storeDecision = decision === 'approve' ? 'approved' : 'rejected';

    if (action === 'review_application') {
      const applicationId = String(body.applicationId ?? '');
      if (!applicationId) {
        return NextResponse.json({ success: false, error: 'applicationId is required' }, { status: 400 });
      }

      const result = reviewMerchantApplication(applicationId, storeDecision, 'admin');
      if ('error' in result) {
        const notFound = result.error === 'Application not found';
        return NextResponse.json(
          { success: false, error: result.error },
          { status: notFound ? 404 : 400 }
        );
      }
      return NextResponse.json({
        success: true,
        data: { application: result },
        message: `Application ${result.status}`,
      });
    }

    if (action === 'review_withdrawal') {
      const withdrawalId = String(body.withdrawalId ?? '');
      if (!withdrawalId) {
        return NextResponse.json({ success: false, error: 'withdrawalId is required' }, { status: 400 });
      }

      const result = reviewMerchantWithdrawal(withdrawalId, storeDecision);
      if ('error' in result) {
        const notFound = result.error === 'Withdrawal not found';
        return NextResponse.json(
          { success: false, error: result.error },
          { status: notFound ? 404 : 400 }
        );
      }
      return NextResponse.json({
        success: true,
        data: { withdrawal: result },
        message: `Withdrawal ${result.status}`,
      });
    }

    return NextResponse.json(
      { success: false, error: "action must be 'review_application' or 'review_withdrawal'" },
      { status: 400 }
    );
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }
}
