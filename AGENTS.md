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
│   │   ├── use-cart.ts         # Cart state management (localStorage)
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
│       │   └── index.ts        # Data access layer (swap for REST API later)
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
- **API Layer**: `src/lib/api/index.ts` — all data access functions (getProducts, getProductBySlug, verifyCode, getQuizResult, submitOrder)
- **Rule**: Pages import from `@/lib/api`, never directly from mock files

## Spree Commerce v2 Compatibility Layer

Implements the Spree 5.4 Storefront API contract so the official Spree Next.js
storefront (or any Spree client) works out of the box. Swap `spree-compat/`
stores with real `SPREE_API_URL` calls later — routes keep the same contract.

- **Response format**: JSON:API `{data: [{id, type, attributes, relationships}], meta, links}`
- **Auth**: `X-Spree-Order-Token` header for guest carts; `Authorization: Bearer <JWT>` (via `POST /spree_oauth/token`, password grant) for account endpoints
- **Checkout state machine**: `cart → address → delivery → payment → confirm → complete`; step endpoints (address/delivery/payment) auto-advance once data is present; `confirm` mirrors Spree confirm→complete semantics; `complete` is idempotent
- **Coupon engine**: `apply-promo-code` reuses `@/lib/coupons/coupon-store` (percentage / fixed / free_shipping types); totals recompute on every mutation
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
- Cart state via `useCart` hook (localStorage persistence)
- Category filtering via searchParams on `/talisman`
- Five Elements quiz uses deterministic rules (same input = same output)
- Verification uses mock codes (FB-2026-XXXXXX format)

## Commands

- `pnpm dev` — Start dev server
- `pnpm build` — Production build
- `pnpm ts-check` — TypeScript type checking
- `pnpm lint` — ESLint

## Extension Points

- Replace `lib/api/index.ts` with real REST API calls
- Add i18n (currently English only)
- Integrate Stripe for real payments
- Add vendor/multi-merchant support
- Connect image_key to object storage
