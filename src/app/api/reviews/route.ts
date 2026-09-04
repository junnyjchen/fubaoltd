import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getUserById } from '@/lib/auth/user-store';
import { getProducts } from '@/lib/api';
import { addReview, hasUserReviewed, hasVerifiedPurchase } from '@/lib/reviews/review-store';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: { productSlug?: unknown; rating?: unknown; content?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const productSlug = typeof body.productSlug === 'string' ? body.productSlug : '';
    const rating = typeof body.rating === 'number' ? body.rating : NaN;
    const content = typeof body.content === 'string' ? body.content.trim() : '';

    if (!productSlug) {
      return NextResponse.json({ error: 'Product slug is required' }, { status: 400 });
    }
    const products = await getProducts();
    const product = products.find((p) => p.slug === productSlug);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be an integer from 1 to 5' }, { status: 400 });
    }
    if (content.length < 5 || content.length > 500) {
      return NextResponse.json(
        { error: 'Review content must be between 5 and 500 characters' },
        { status: 400 },
      );
    }
    if (hasUserReviewed(productSlug, session.sub)) {
      return NextResponse.json(
        { error: 'You have already reviewed this talisman' },
        { status: 409 },
      );
    }

    const user = await getUserById(session.sub);
    const review = addReview({
      productSlug,
      author: user?.name ?? 'FuBao Customer',
      userId: session.sub,
      rating,
      content,
      verifiedPurchase: hasVerifiedPurchase(session.sub, productSlug),
    });

    return NextResponse.json({ success: true, data: review }, { status: 200 });
  } catch (error) {
    console.error('Review submission failed:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
