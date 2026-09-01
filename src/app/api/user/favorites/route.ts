import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

// Store persisted on globalThis so all route modules share one instance in dev
// (module-scoped state is NOT shared across route modules — see AGENTS.md).
const globalStore = globalThis as unknown as {
  __fubaoFavorites?: Map<string, Set<string>>;
};
const favorites: Map<string, Set<string>> = (globalStore.__fubaoFavorites ??=
  new Map());

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const userFavs = favorites.get(session.sub);
    return NextResponse.json({
      success: true,
      data: { favorites: userFavs ? Array.from(userFavs) : [] },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { productSlug } = await request.json();
    if (!productSlug) return NextResponse.json({ success: false, error: 'Product slug required' }, { status: 400 });

    if (!favorites.has(session.sub)) favorites.set(session.sub, new Set());
    const userFavs = favorites.get(session.sub)!;

    if (userFavs.has(productSlug)) {
      userFavs.delete(productSlug);
      return NextResponse.json({ success: true, data: { action: 'removed', productSlug } });
    } else {
      userFavs.add(productSlug);
      return NextResponse.json({ success: true, data: { action: 'added', productSlug } });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
