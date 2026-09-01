import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import {
  getMerchantByUserId,
  getMerchantProducts,
  createMerchantProduct,
  updateMerchantProduct,
} from '@/lib/merchant/merchant-store';

export async function GET() {
  try {
    const user = await requireAuth();
    const merchant = getMerchantByUserId(user.sub);
    if (!merchant) {
      return NextResponse.json(
        { success: false, error: 'Merchant profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: getMerchantProducts(merchant.id),
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to load products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const merchant = getMerchantByUserId(user.sub);
    if (!merchant) {
      return NextResponse.json(
        { success: false, error: 'Merchant profile not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, price, category, stock, description, imageKey } = body;

    if (!name || typeof price !== 'number' || !category) {
      return NextResponse.json(
        { success: false, error: 'Name, price and category are required' },
        { status: 400 }
      );
    }

    const result = createMerchantProduct({
      merchantId: merchant.id,
      name,
      price,
      category,
      tagline: description || '',
      imageKey: imageKey || '',
      stock: typeof stock === 'number' ? stock : 0,
    });

    if ('error' in result) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, data: result, message: 'Product created (pending review)' },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    const merchant = getMerchantByUserId(user.sub);
    if (!merchant) {
      return NextResponse.json(
        { success: false, error: 'Merchant profile not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { productId, ...updates } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'productId is required' },
        { status: 400 }
      );
    }

    const result = updateMerchantProduct(productId, merchant.id, updates);
    if (!result || 'error' in result) {
      return NextResponse.json(
        { success: false, error: result && 'error' in result ? result.error : 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}
