/**
 * Admin console — Product catalog management.
 *
 * GET    → all products (including free gifts + deactivated) with sales stats
 *         computed from completed Spree orders
 * POST   → create product { slug, name, price, category, tagline, story? }
 * PUT    → { slug, updates: { price?, stock?, tagline?, isActive? } }
 * DELETE → ?slug= — hard delete (refused while orders reference the slug)
 *
 * Price edits propagate instantly: cart pricing (order-store), listings and
 * the Spree serializer all read the same globalThis-backed catalog array.
 * Admin role required (see AGENTS.md auth patterns).
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import { createProductAdmin, deleteProductAdmin, products, updateProductAdmin } from '@/lib/data/products';
import type { Product } from '@/lib/data/types';
import { listAllOrders } from '@/lib/spree-compat/order-store';

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

  // Sales per product, from completed orders only
  const salesBySlug = new Map<string, { units: number; revenue: number }>();
  for (const order of listAllOrders()) {
    if (order.state !== 'complete') continue;
    for (const item of order.lineItems) {
      const entry = salesBySlug.get(item.slug) ?? { units: 0, revenue: 0 };
      entry.units += item.quantity;
      entry.revenue += item.price * item.quantity;
      salesBySlug.set(item.slug, entry);
    }
  }

  const data = products.map((p) => {
    const sales = salesBySlug.get(p.slug) ?? { units: 0, revenue: 0 };
    return {
      slug: p.slug,
      name: p.name,
      price: p.price,
      category: p.category,
      tagline: p.tagline,
      imageKey: p.image_key,
      stock: p.stock ?? null,
      isActive: p.isActive !== false,
      isFreeGift: !!p.isFreeGift,
      rating: p.rating,
      reviewCount: p.reviewCount,
      soldUnits: sales.units,
      salesRevenue: Number(sales.revenue.toFixed(2)),
    };
  });

  return NextResponse.json({
    success: true,
    data: {
      products: data,
      stats: {
        total: data.length,
        active: data.filter((p) => p.isActive).length,
        inactive: data.filter((p) => !p.isActive).length,
        lowStock: data.filter((p) => p.stock !== null && p.stock <= 10).length,
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
    const slug = String(body.slug ?? '').trim().toLowerCase();
    const name = String(body.name ?? '').trim();
    const price = Number(body.price);
    const category = String(body.category ?? '');
    const tagline = String(body.tagline ?? '').trim();

    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || slug.length < 3 || slug.length > 60) {
      return NextResponse.json(
        { success: false, error: 'Slug must be 3-60 chars, lowercase letters/digits/hyphens (e.g. peace-talisman)' },
        { status: 400 }
      );
    }
    if (name.length < 2) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    }
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ success: false, error: 'Price must be a non-negative number' }, { status: 400 });
    }
    const validCategories: Product['category'][] = ['Protection', 'Home Blessing', 'Career', 'Gift Sets'];
    if (!validCategories.includes(category as Product['category'])) {
      return NextResponse.json(
        { success: false, error: `Category must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }
    if (!tagline) {
      return NextResponse.json({ success: false, error: 'Tagline is required' }, { status: 400 });
    }
    if (products.some((p) => p.slug === slug)) {
      return NextResponse.json({ success: false, error: 'Slug already exists' }, { status: 409 });
    }

    const rawImageKey = body.imageKey === undefined || body.imageKey === null
      ? ''
      : String(body.imageKey).trim();
    if (rawImageKey && !rawImageKey.startsWith('products/')) {
      return NextResponse.json(
        { success: false, error: 'imageKey must be an uploaded key (products/…) — use the upload control' },
        { status: 400 }
      );
    }

    const product = createProductAdmin({
      slug,
      name,
      price,
      category: category as Product['category'],
      tagline,
      imageKey: rawImageKey || undefined,
    });
    if (!product) {
      return NextResponse.json({ success: false, error: 'Invalid product data' }, { status: 400 });
    }

    return NextResponse.json(
      { success: true, data: { slug: product.slug, name: product.name }, message: `${product.name} created` },
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
    const slug = String(body.slug ?? '').trim();
    const updates = (body.updates ?? {}) as {
      price?: number;
      stock?: number;
      tagline?: string;
      isActive?: boolean;
      imageKey?: string;
    };
    if (updates.imageKey !== undefined) {
      const key = String(updates.imageKey).trim();
      if (key && !key.startsWith('products/')) {
        return NextResponse.json(
          { success: false, error: 'imageKey must be an uploaded key (products/…)' },
          { status: 400 }
        );
      }
      (updates as { image_key?: string }).image_key = key || `talisman-${slug}.jpg`;
    }

    if (!slug) {
      return NextResponse.json({ success: false, error: 'Product slug is required' }, { status: 400 });
    }
    if (!products.some((p) => p.slug === slug)) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    if (
      (updates.price !== undefined && (typeof updates.price !== 'number' || updates.price < 0)) ||
      (updates.stock !== undefined && (typeof updates.stock !== 'number' || !Number.isInteger(updates.stock) || updates.stock < 0)) ||
      (updates.tagline !== undefined && typeof updates.tagline !== 'string')
    ) {
      return NextResponse.json({ success: false, error: 'Invalid update values' }, { status: 400 });
    }

    const updated = updateProductAdmin(slug, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Invalid update values' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        slug: updated.slug,
        price: updated.price,
        stock: updated.stock ?? null,
        tagline: updated.tagline,
        isActive: updated.isActive !== false,
      },
      message: `${updated.name} updated`,
    });
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

  const slug = (request.nextUrl.searchParams.get('slug') ?? '').trim().toLowerCase();
  if (!slug) {
    return NextResponse.json({ success: false, error: 'Product slug is required' }, { status: 400 });
  }
  const existing = products.find((p) => p.slug === slug);
  if (!existing) {
    return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
  }
  if (slug === 'free-blessing-talisman') {
    return NextResponse.json(
      { success: false, error: 'The free blessing gift cannot be deleted (required by /blessing)' },
      { status: 400 }
    );
  }
  const referencedByOrder = listAllOrders().some((order) =>
    order.lineItems.some((item) => item.slug === slug)
  );
  if (referencedByOrder) {
    return NextResponse.json(
      { success: false, error: 'Cannot delete: order history references this product. Deactivate it instead.' },
      { status: 400 }
    );
  }

  deleteProductAdmin(slug);
  return NextResponse.json({ success: true, data: { slug }, message: `${existing.name} deleted` });
}
