# FuBao (符宝) — Project Context

## Project Overview

FuBao is a Taoist talisman cultural e-commerce site targeting overseas markets. Brand name: FuBao. Sells hand-drawn Taoist talismans and Eastern cultural accessories. All UI in English, priced in USD.

**Compliance**: No supernatural claims. Products are "cultural artifacts / energy art / spiritual keepsakes". Footer always shows "For entertainment purposes only."

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5 (strict mode)
- **UI Components**: shadcn/ui (Radix UI)
- **Styling**: Tailwind CSS 4
- **Package Manager**: pnpm only

## Directory Structure

```
├── public/                     # Static assets
├── src/
│   ├── app/                    # Pages (App Router)
│   │   ├── layout.tsx          # Root layout (Header + Footer)
│   │   ├── page.tsx            # Homepage
│   │   ├── globals.css         # Global styles + design tokens
│   │   ├── talisman/
│   │   │   ├── page.tsx        # Product listing with category filter
│   │   │   └── [slug]/
│   │   │       ├── page.tsx    # Product detail (server)
│   │   │       └── client.tsx  # Add-to-cart (client)
│   │   ├── verify/
│   │   │   ├── page.tsx        # Verification page (server)
│   │   │   └── client.tsx      # Verification form (client)
│   │   ├── elements-quiz/
│   │   │   ├── page.tsx        # Five Elements quiz (server)
│   │   │   └── client.tsx      # Quiz logic (client)
│   │   ├── cart/
│   │   │   ├── page.tsx        # Cart page (server)
│   │   │   └── client.tsx      # Cart interactions (client)
│   │   ├── checkout/
│   │   │   ├── page.tsx        # Checkout (server)
│   │   │   └── client.tsx      # Checkout form (client)
│   │   ├── order/[id]/page.tsx # Order confirmation
│   │   ├── about/page.tsx      # About page
│   │   ├── artisans/page.tsx   # Artisan/vendor showcase (Spree vendors)
│   │   └── faq/page.tsx        # FAQ page
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── header.tsx      # Site header (client)
│   │   │   ├── footer.tsx      # Site footer (server)
│   │   │   ├── font-preload.tsx # Font preconnect (client)
│   │   │   └── newsletter-form.tsx # Newsletter (client)
│   │   └── shared/             # Shared components
│   ├── hooks/
│   │   ├── use-cart.ts         # Cart state (server cart via Spree guest token)
│   │   └── use-mobile.ts       # Mobile detection
│   ├── api/                    # REST API routes
│   │   └── v2/storefront/      # Spree Commerce API v2 compatibility layer
│   │       ├── products/       # GET list (filter[name]/filter[taxons]/page) + [slug]
│   │       ├── taxons/         # GET category tree
│   │       ├── vendors/        # GET multi-vendor list
│   │       ├── cart/           # POST create (guest token) / add-item / set-quantity /
│   │       │                   # remove-line-item / empty / apply-promo-code /
│   │       │                   # estimate_shipping_rates / associate
│   │       ├── checkout/       # next / advance / address / delivery / shipments /
│   │       │                   # shipping_rates / payment / payment_methods /
│   │       │                   # confirm / complete / order_status
│   │       ├── spree_oauth/    # POST token (password grant)
│   │       └── account/        # GET/PATCH profile / orders / orders/[number] /
│   │                           # credit_cards / addresses
│   └── lib/
│       ├── api/
│       │   └── index.ts        # Data access facade (routes reads through spree/queries)
│       ├── spree/              # Spree integration layer (frontend side)
│       │   ├── client.ts       # HTTP client: SPREE_API_URL env or local /api/v2/storefront
│       │   ├── adapter.ts      # Spree JSON:API -> internal type mapping
│       │   └── queries.ts      # Server-side queries (in-process, no HTTP)
│       ├── spree-compat/       # Spree contract layer
│       │   ├── types.ts        # JSON:API response types (SpreeResource etc.)
│       │   ├── serializers.ts  # Product/Taxon/Vendor JSON:API serializers
│       │   ├── order-store.ts  # In-memory order state machine (globalThis)
│       │   └── order-serializer.ts # Cart/Order JSON:API serializer
│       ├── data/
│       │   ├── types.ts        # TypeScript type definitions
│       │   └── products.ts     # Mock product/review/verification data
│       └── utils.ts            # Utility functions (cn)
├── DESIGN.md                   # Design tokens & style guide
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Data Layer Architecture

- **Types**: `src/lib/data/types.ts` — all TypeScript interfaces
- **Mock Data**: `src/lib/data/products.ts` — products, reviews, verification records
- **API Layer**: `src/lib/api/index.ts` — data access facade; product reads route through `@/lib/spree/queries` (Spree contract layer)
- **Rule**: Pages import from `@/lib/api`, never directly from mock files

## Frontend Spree Integration (src/lib/spree/)

The frontend runs on the Spree v2 contract end-to-end:

- **`client.ts`** — HTTP client used by client components. `resolveBaseUrl()`: with `SPREE_API_URL` set it calls a real remote Spree; otherwise the local compatibility layer `/api/v2/storefront`. Exposes `spreeCartCreate/AddItem/SetQuantity/RemoveItem/Empty`, `spreeGetVariantId` (resolves slug → variant id), `spreeApplyPromoCode`, and `spreeCheckoutAddress/Delivery/Payment/Confirm/Complete`. `SpreeCart` carries `itemTotal/shipTotal/promoTotal/total/couponCode`
- **`adapter.ts`** — maps Spree JSON:API resources → internal types (Product, CartItem)
- **`queries.ts`** — server-side product queries calling spree-compat serializers in-process (zero HTTP overhead for RSC pages)
- **Cart flow**: `useCart` stores the guest token in localStorage (`fubao_cart_token`); the token comes from the `X-Spree-Order-Token` response header of `POST /cart`. `addItem(slug, qty, personalization)` passes personalization via Spree line-item `options`. The hook also exposes `totals` (server-owned cart totals) and `applyPromo(code)` which returns `{ok, error}` — cart page renders the promo input and discount line from these
- **Checkout flow**: `checkout/client.tsx` walks the Spree state machine (address → delivery → payment → confirm → complete) and redirects to `/order/[number]`. Payment methods are fetched from `GET /checkout/payment_methods` (stripe / crypto) and rendered as radio options — never hardcoded. The order summary uses server-owned `useCart().totals` (item/ship/promo/total + `couponCode`); after completion `resetCart()` drops the guest token. `order/[id]/page.tsx` reads the order via `getOrderDetailForOrderNumber` and renders the full breakdown: line items (with personalization options), subtotal, shipping, promo discount line, ship-to address, total
- **Account flow**: `account/client.tsx` fetches real order history from `GET /api/v2/storefront/account/orders` (session cookie auth) and links each order to `/order/[number]`
- **Artisan (vendor) showcase**: `getArtisans()` / `getArtisanForProduct(slug)` in `lib/api` read the Spree vendor contract in-process (approved merchants from `@/lib/merchant/merchant-store`, slug→vendor via `PRODUCT_VENDOR_MAP`). `/artisans` page renders vendor cards (certification badge, city, product count, deep links); product detail shows "Hand-drawn by <vendor>" linking to `/artisans`. Vendor JSON:API attributes follow Spree (`about_us`, `certification`, `city`)
- **Key invariant**: slug/variant resolution and totals are owned by the Spree layer — the frontend never computes prices itself

## Spree Commerce v2 Compatibility Layer

Implements the Spree 5.4 Storefront API contract so the official Spree Next.js
storefront (or any Spree client) works out of the box. Swap `spree-compat/`
stores with real `SPREE_API_URL` calls later — routes keep the same contract.

- **Response format**: JSON:API `{data: [{id, type, attributes, relationships}], meta, links}`
- **Auth**: `X-Spree-Order-Token` header for guest carts; account endpoints accept `Authorization: Bearer <JWT>` (via `POST /spree_oauth/token`, password grant) **or** the site's httpOnly session cookie as fallback (`account-auth.ts` → `resolveAccountAuth`), so browser fetches work without token plumbing
- **Checkout state machine**: `cart → address → delivery → payment → confirm → complete`; step endpoints (address/delivery/payment) auto-advance once data is present; `confirm` mirrors Spree confirm→complete semantics; `complete` is idempotent
- **Coupon engine**: `apply-promo-code` reuses `@/lib/coupons/coupon-store` (percentage / fixed / free_shipping types; WELCOME10 / SAVE5 / FREESHIP / VIP20). The applied `coupon_code` persists on the order and is serialized (`coupon_code` + `promo_total` attributes); every cart mutation revalidates the coupon against the new item total and recomputes the discount (min-order checks re-run)
- **State persistence**: `order-store.ts` keeps in-memory Maps on `globalThis` so all routes share state across module instances in dev
- **Users**: reuses `@/lib/auth/user-store` (demo@fubao.com / demo123); JWT issued by `@/lib/auth/jwt`

## Design Tokens

Defined in `src/app/globals.css` and `DESIGN.md`:
- `--paper`: #F7F3ED (background)
- `--ink`: #1A1A1A (text)
- `--cinnabar`: #C23B22 (accent)
- `--gold`: #B8860B (decorative)
- `--smoke`: #6B6B6B (secondary text)
- `--jade`: #E8E4DC (card/section bg)
- Fonts: Cormorant Garamond (headings), Inter (body)

## Key Patterns

- Server Components by default, `'use client'` only for interactivity
- Cart state via `useCart` hook (server cart + Spree guest token in localStorage)
- Category filtering via searchParams on `/talisman`; pills come from `getTaxons()` (Spree taxon tree, root "Categories" + 4 children); taxon names match `Product.category` values exactly
- Product search via `?q=` searchParam on `/talisman` (`SearchBox` client component, `talisman/search-box.tsx`): matches product name/tagline/description case-insensitively, composes with `?category=`, "N results for 'query'" indicator + "View all talismans" reset link; empty state with curated suggestions when 0 hits. `getProducts({ search })` mirrors Spree `filter[name]` semantics
- Five Elements quiz uses deterministic rules (same input = same output)
- Verification uses mock codes (FB-2026-XXXXXX format)
- AI Assistant (`/ai-chat`): SSE streaming (`/api/ai/chat`), model selector from `/api/ai/models` (doubao-seed/lite/pro), markdown rendering (react-markdown + remark-gfm), RAG over knowledge base (`usedKnowledge` meta frame after content frames, `data: [DONE]` terminator). System prompt injects the live product catalog via `getProducts()` so answers link real slugs (`[Protection Talisman](/talisman/protection-talisman)`); compliance rules enforced (no supernatural claims, "For entertainment purposes only"). Client controls: stop generation (AbortController), copy message, regenerate last answer, clear chat. Abort-safe stream: controller closed after cancel → enqueue guarded by try/catch

## Known Auth Patterns (Important)

- `requireAuth(request)` **throws** `'Unauthorized'`; `requireRole(request, role)` **throws** `'Forbidden'` — route handlers must catch and map to 401/403 (see `api/merchant/*`, `api/admin/stats` for the canonical pattern)
- `useAuth()` provides `{ user, isLoading, login, register, logout, refreshUser }` — there is NO `status` field; client guards use `isLoading`/`user`
- Merchant area: login at `/merchant/login` (site auth) → `/merchant/dashboard`; unauthed pages redirect via `?redirect=` param. Merchant role required for `api/merchant/*` (403 otherwise). Demo accounts: merchant@fubao.com / merchant123, admin@fubao.com / admin123
- Admin area: `/admin/dashboard` (role `admin`)

## Commands

- `pnpm dev` — Start dev server
- `pnpm build` — Production build
- `pnpm ts-check` — TypeScript type checking
- `pnpm lint` — ESLint

## Extension Points

- Point `SPREE_API_URL` at a real Spree 5.4 instance — routes and frontend switch over without code changes
- Add i18n (currently English only)
- Integrate Stripe for real payments
- Add vendor/multi-merchant support
- Connect image_key to object storage
