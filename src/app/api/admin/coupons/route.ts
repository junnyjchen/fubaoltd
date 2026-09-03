/**
 * Admin console — Coupon management (full CRUD).
 *
 * GET    → all coupons + usage stats
 * POST   → create coupon { code, type, value, minOrderAmount?, validFrom,
 *          validUntil, usageLimit?, perUserLimit?, maxDiscount?, applicableCategories?,
 *          isActive? }
 * PUT    → { code, updates } — edit any mutable field
 * DELETE → ?code= — remove coupon
 *
 * Validation is enforced on every write; the same store powers
 * apply-promo-code at checkout, so edits are live instantly.
 * Admin role required.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import type { Coupon } from '@/lib/coupons/types';
import { createCoupon, deleteCoupon, getAllCoupons, updateCoupon } from '@/lib/coupons/coupon-store';

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

function validateCouponBody(
  body: Record<string, unknown>
): { ok: true; input: Omit<Coupon, 'id' | 'usedCount' | 'createdAt'> } | { ok: false; error: string } {
  const code = String(body.code ?? '').trim().toUpperCase();
  const type = String(body.type ?? '') as Coupon['type'];
  const value = Number(body.value);
  const validFrom = String(body.validFrom ?? '');
  const validUntil = String(body.validUntil ?? '');

  if (!/^[A-Z0-9]{3,20}$/.test(code)) return { ok: false, error: 'Code must be 3-20 letters/digits' };
  if (!['percentage', 'fixed', 'free_shipping'].includes(type)) {
    return { ok: false, error: "Type must be 'percentage', 'fixed' or 'free_shipping'" };
  }
  if (!Number.isFinite(value) || value <= 0) return { ok: false, error: 'Value must be a positive number' };
  if (type === 'percentage' && value > 100) return { ok: false, error: 'Percentage cannot exceed 100' };
  if (!validFrom || !validUntil) return { ok: false, error: 'validFrom and validUntil are required' };
  if (validUntil <= validFrom) return { ok: false, error: 'validUntil must be after validFrom' };

  const minOrderAmount = body.minOrderAmount === undefined ? undefined : Number(body.minOrderAmount);
  if (minOrderAmount !== undefined && (!Number.isFinite(minOrderAmount) || minOrderAmount < 0)) {
    return { ok: false, error: 'minOrderAmount must be a non-negative number' };
  }
  const usageLimit = body.usageLimit === undefined ? 1000 : Number(body.usageLimit);
  if (!Number.isInteger(usageLimit) || usageLimit <= 0) {
    return { ok: false, error: 'usageLimit must be a positive integer' };
  }
  const perUserLimit = body.perUserLimit === undefined ? 1 : Number(body.perUserLimit);
  if (!Number.isInteger(perUserLimit) || perUserLimit <= 0) {
    return { ok: false, error: 'perUserLimit must be a positive integer' };
  }
  const maxDiscount = body.maxDiscount === undefined ? undefined : Number(body.maxDiscount);
  if (maxDiscount !== undefined && (!Number.isFinite(maxDiscount) || maxDiscount <= 0)) {
    return { ok: false, error: 'maxDiscount must be a positive number' };
  }

  return {
    ok: true,
    input: {
      code,
      type,
      value,
      minOrderAmount,
      maxDiscount,
      validFrom,
      validUntil,
      usageLimit,
      perUserLimit,
      applicableCategories:
        Array.isArray(body.applicableCategories) && body.applicableCategories.length > 0
          ? body.applicableCategories.map(String)
          : undefined,
      isActive: body.isActive === undefined ? true : Boolean(body.isActive),
    },
  };
}

export async function GET() {
  try {
    await requireRole('admin');
  } catch (error) {
    const mapped = authError(error);
    if (mapped) return mapped;
    throw error;
  }

  const coupons = getAllCoupons();
  const now = new Date().toISOString();
  return NextResponse.json({
    success: true,
    data: {
      coupons,
      stats: {
        total: coupons.length,
        active: coupons.filter((c) => c.isActive && c.validFrom <= now && c.validUntil > now).length,
        expired: coupons.filter((c) => c.validUntil <= now).length,
        disabled: coupons.filter((c) => !c.isActive).length,
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
    const validated = validateCouponBody(body);
    if (!validated.ok) {
      return NextResponse.json({ success: false, error: validated.error }, { status: 400 });
    }
    if (getAllCoupons().some((c) => c.code === validated.input.code)) {
      return NextResponse.json({ success: false, error: 'Coupon code already exists' }, { status: 409 });
    }

    const coupon = createCoupon(validated.input);
    return NextResponse.json(
      { success: true, data: { coupon }, message: `Coupon ${coupon.code} created` },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireRole('admin');
  } catch (error) {
    const mapped = authError(error);
    if (mapped) return mapped;
    throw error;
  }

  try {
    const body = await request.json();
    const code = String(body.code ?? '').trim().toUpperCase();
    const updates = (body.updates ?? {}) as Record<string, unknown>;

    if (!code) {
      return NextResponse.json({ success: false, error: 'Coupon code is required' }, { status: 400 });
    }
    if (!getAllCoupons().some((c) => c.code === code)) {
      return NextResponse.json({ success: false, error: 'Coupon not found' }, { status: 404 });
    }
    if (updates.value !== undefined) {
      const value = Number(updates.value);
      if (!Number.isFinite(value) || value <= 0) {
        return NextResponse.json({ success: false, error: 'Value must be a positive number' }, { status: 400 });
      }
    }
    if (updates.validFrom !== undefined && updates.validUntil !== undefined) {
      if (String(updates.validUntil) <= String(updates.validFrom)) {
        return NextResponse.json({ success: false, error: 'validUntil must be after validFrom' }, { status: 400 });
      }
    }

    const coupon = updateCoupon(code, updates);
    if (!coupon) {
      return NextResponse.json(
        { success: false, error: 'Invalid updates (check value / usageLimit >= usedCount)' },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true, data: { coupon }, message: `Coupon ${coupon.code} updated` });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireRole('admin');
  } catch (error) {
    const mapped = authError(error);
    if (mapped) return mapped;
    throw error;
  }

  const code = (request.nextUrl.searchParams.get('code') ?? '').trim().toUpperCase();
  if (!code) {
    return NextResponse.json({ success: false, error: 'Coupon code is required' }, { status: 400 });
  }
  const removed = deleteCoupon(code);
  if (!removed) {
    return NextResponse.json({ success: false, error: 'Coupon not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: { code }, message: `Coupon ${code} deleted` });
}
