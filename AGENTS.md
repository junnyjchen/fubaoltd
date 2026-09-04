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
├── public/                     # Static assets (og-brand.png share card)
├── src/lib/newsletter/         # Newsletter store (globalThis)
├── src/lib/reviews/            # Review store (globalThis __fubaoReviews)
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
│   │   ├── wishlist/           # Saved favorites (server page + client grid)
│   │   ├── notifications/      # Notification center (server page + client list)
│   │   ├── giveaways/          # Giveaway center (server page + client claim flow)
│   │   ├── coupons/            # Coupon center (server page + client claim flow)
│   │   ├── wallet/             # Crypto wallet center (server page + client)
│   │   ├── wishes/             # Public wish wall (page + client form; approved only)
│   │   ├── about/page.tsx      # About page
│   │   ├── artisans/page.tsx   # Artisan/vendor showcase (Spree vendors)
│   │   └── faq/page.tsx        # FAQ page
│   │   └── admin/              # Admin console (role admin; pages below)
│   │       ├── dashboard/      # Stats overview + nav
│   │       ├── blessing/       # Free Blessing activity console
│   │       ├── products/       # Product CRUD (list/create/edit/unlist/delete)
│   │       ├── orders/         # Order list + shipment status management
│   │       ├── coupons/        # Coupon CRUD + live engine validation
│   │       ├── giveaways/      # Giveaway campaign CRUD
│   │       ├── merchants/      # Merchant application review + withdrawals
│   │       ├── wishes/         # Wish wall moderation (approve/unapprove/delete)
│   │       ├── ai-training/    # AI knowledge base
│   │       └── knowledge/      # Knowledge base manager
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── header.tsx      # Site header (client)
│   │   │   ├── footer.tsx      # Site footer (server)
│   │   │   ├── font-preload.tsx # Font preconnect (client)
│   │   │   ├── notifications-bell.tsx # Header bell + unread badge (client)
│   │   │   └── newsletter-form.tsx # Newsletter (client)
│   │   └── shared/             # Shared components (favorite-button, track-view, product-card…)
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
│   ├── (also /api/auth/*, /api/user/{checkin,points,favorites,history},
│   │    /api/notifications, /api/ai/*, /api/merchant/*,
│   │    /api/admin/{stats,blessing,products,orders,coupons,giveaways,merchants},
│   │    /api/coupons, /api/crypto/*, /api/wallet/{balance,topup,history},
│   │    /api/giveaways, /api/distribution, /api/distribution/{links,track,withdraw},
│   │    /api/reviews (product review submit), /api/wishes, /api/newsletter,
│   │    /api/blessing, /api/admin/{wishes,newsletter})
│   └── lib/
│       ├── api/
│       │   └── index.ts        # Data access facade (routes reads through spree/queries)
│       ├── favorites/
│       │   └── favorites-context.tsx # React context: server-backed wishlist (auth users)
│       ├── notifications/
│       │   ├── notification-store.ts # In-memory notifications (globalThis)
│       │   └── order-notify.ts       # notifyOrderCompleted (dedup via meta.orderId)
│       ├── spree/              # Spree integration layer (frontend side)
│       │   ├── client.ts       # HTTP client: SPREE_API_URL env or local /api/v2/storefront
│       │   ├── adapter.ts      # Spree JSON:API -> internal type mapping
│       │   └── queries.ts      # Server-side queries (in-process, no HTTP)
│       ├── spree-compat/       # Spree contract layer
│       │   ├── types.ts        # JSON:API response types (SpreeResource etc.)
│       │   ├── serializers.ts  # Product/Taxon/Vendor JSON:API serializers
│       │   ├── account-auth.ts # resolveAccountAuth (Bearer OR session cookie)
│       │   ├── order-store.ts  # In-memory order state machine (globalThis)
│       │   └── order-serializer.ts # Cart/Order JSON:API serializer +
│       │                           # resolveRequestUser (dual-mode like account-auth)
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
- **Free Blessing (免費接福)**: `free-blessing-talisman` product carries `isFreeGift: true` (price 0) — hidden from `/talisman` listings AND `GET /products` (both `queries.ts` list paths filter it; slug lookups still serve it). `/blessing` page (server + client) offers two claim paths: **on-site pickup** (generates `FB-BLESS-XXXXXXXX` code, shown with copy button + temple address) or **mail** (adds the item to a Spree guest cart at $0.00, then normal checkout where the user pays shipping only). One claim per account (`blessing-store` on globalThis); cross-method re-claim → 400; same-method re-POST is an idempotent resume (dedupe by checking line items). Claim fires a notification ("Blessing Reserved for Pickup" / "Free Blessing Added to Your Cart"). Entry points: homepage hero CTA, footer link, account Quick Actions, product-detail CTA on the free product's own page (which replaces Add to Cart). `is_free_gift` is serialized in the Spree product attributes (`serializers.ts` + `adapter.ts` mappings)
- **Blessing activity management**: `/admin/blessing` console (admin role; middleware redirects anon to login) backed by `/api/admin/blessing` — GET returns `{config, claims, stats, product}`, PUT updates `BlessingConfig` (active/startAt/endAt/totalQuota/pickupAddress/pickupHours/note — empty strings sanitize to null), POST `{action:'redeem', claimId}` marks a claim `fulfilled`, DELETE `?claimId=` removes it (frees quota). `checkBlessingAvailability()` (store) is the single source of truth — returns `{status, message, claimable, config}` with statuses `open | inactive | not_started | ended | full` (quota counts non-deleted claims); the public GET `/api/blessing` is anon-safe and exposes `{availability, config, claim}`; POST re-checks availability before recording. Claims are enriched server-side with `userName`/`userEmail`/`userId` (via async `getUserById`). The public `/blessing` client renders every activity state (upcoming countdown, ended, fully claimed, paused) from this contract. Config + claims persist on globalThis (`__fubaoBlessingConfig` / `__fubaoBlessingClaims`)

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

- Newsletter (`components/layout/newsletter-form.tsx`): real subscription flow over `src/lib/newsletter/newsletter-store.ts` (globalThis, email-dedup). Public `POST /api/newsletter {email, source?}` → 201/200 with welcome message; duplicate email → 409 "This email is already subscribed"; invalid/missing email → 400. Form has full state machine (idle → submitting "Joining…" disabled → success/error note); source field tracks origin (footer). Admin `GET /api/admin/newsletter` (role admin) returns `{subscribers, stats {total, thisWeek, topSource}}`; console `/admin/newsletter` lists subscribers with source badges + stats cards. Nav entry wired across the 7 consoles that have navItems (blessing/ai-training/knowledge have no navItems by legacy design)
- Error & 404 pages: `src/app/not-found.tsx` (branded "Page Not Found" — ink frame, cinnabar seal, Return Home / Browse Talismans CTAs, sets `title`) and `src/app/error.tsx` (client boundary: digest log + reset retry). Both match the paper/ink/cinnabar design language; unknown product/article slugs (via `notFound()`) and random paths all render the branded 404 with HTTP 404 status

- Open Graph images: `public/og-brand.png` (2560x1440, brand card: xuan paper bg + cinnabar talisman + ink wordmark + vermillion seal). Root layout `metadata.openGraph` sets default `og:image`/`og:image:width/height`/`twitter:card: summary_large_image`; product + article detail pages inherit it via their own `openGraph` blocks (no per-item images yet — article `coverImage` seeds are empty). Combined with `metadataBase` (env domain) all shares render rich cards on X/Facebook/WhatsApp
- SEO (`sitemap.ts` / `robots.ts`): base URL comes from `process.env.COZE_PROJECT_DOMAIN_DEFAULT` (fallback `https://fubao.co`) — never hardcoded. Sitemap enumerates all public pages + product slugs (`getProducts()`) + article slugs (`getArticles()`), excluding private areas. Robots allows `/` but disallows `/admin/`, `/merchant/`, `/account`, `/cart`, `/checkout`, `/order/`, `/wallet`, `/notifications`, `/wishlist`, `/referral`, `/api/` and references the sitemap at the env domain

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
- AI Translation (`/api/ai/translate`, POST `{text, targetLang?, sourceLang?}`): LLM translation (doubao-seed-mini, temperature 0.3) with Taoist terminology system prompt (符箓/开光 get original term in parentheses on first use). Body parse + empty-text validated → 400 (never 500). Consumed by `/admin/knowledge` console: "Translate to English" button pre-fills the textarea with the translation (`setTextContent`) before import — Chinese source material becomes English RAG fuel in one click
- AI Assistant (`/ai-chat`): SSE streaming (`/api/ai/chat`), model selector from `/api/ai/models` (doubao-seed/lite/pro), markdown rendering (react-markdown + remark-gfm), RAG over knowledge base (`usedKnowledge` meta frame after content frames, `data: [DONE]` terminator). System prompt injects the live product catalog via `getProducts()` so answers link real slugs (`[Protection Talisman](/talisman/protection-talisman)`); compliance rules enforced (no supernatural claims, "For entertainment purposes only"). Client controls: stop generation (AbortController), copy message, regenerate last answer, clear chat. Abort-safe stream: controller closed after cancel → enqueue guarded by try/catch
- AI Assistant floating entry (`components/shared/ai-assistant-fab.tsx`, mounted in root layout): cinnabar FAB bottom-right on all storefront pages — hidden on `/ai-chat` and under `/admin` + `/merchant` (client-side `usePathname`). Expands to a panel with 4 suggested questions + free-text input; both hand off via `router.push('/ai-chat?q=' + encodeURIComponent(q))`. The chat page reads `searchParams.q` (server, Next 16 Promise form) → passes `initialQuery` to `AIChatClient`, which auto-sends once on mount (`autoSentRef` guard so `runStream` identity changes never re-send; effect MUST sit after the `runStream` useCallback — deps array is evaluated at render time, earlier placement = TDZ crash) and then `window.history.replaceState` cleans the URL so refresh doesn't re-send. `<Toaster offset="104px">` in root layout keeps toasts above the FAB
- Daily check-in (`/account` card): `GET /api/user/checkin` returns `{canCheckIn, streak, totalDays, lastCheckIn, nextReward}` (nextReward = points for the NEXT check-in); `POST` awards points from the weekly cycle `CHECKIN_REWARDS = [5,5,10,10,15,15,30]` and returns `{streak, pointsEarned, message}`; duplicate same-day POST → 400 "Already checked in today". The client (`account/client.tsx`) mirrors the reward table for the 7-Day Rewards strip (completed days in cycle = `canCheckIn ? streak % 7 : ((streak - 1) % 7) + 1`) and shows a level progress bar. Level thresholds live in `user-store.ts addPoints` (silver ≥ 500, gold ≥ 2000, platinum ≥ 5000) — client `LEVELS` array must mirror them exactly. New users start with 100 points (welcome bonus)
- Wishlist (`FavoritesProvider` in `lib/favorites/favorites-context.tsx`, mounted in root layout): server-backed via `GET/POST /api/user/favorites` (POST toggles, returns `{action: 'added'|'removed'}`); anonymous users get localStorage fallback + login prompt toast. `FavoriteButton` (heart, `components/shared/`) on `/talisman` cards + product detail; `/wishlist` renders favorites with a mini product card grid. All favorites APIs require auth (401 otherwise)
- Browsing history: `TrackView` (invisible client component, `components/shared/`) fires `POST /api/user/history {productSlug, productName}` on product detail mount; store keeps last 10 per user, most-recent-first, dedupes consecutive repeats. `GET /api/user/history` returns `{history: [{productSlug, productName, viewedAt}]}`
- Notifications: `GET /api/notifications` → `{notifications: [{id, title, message, link, read, createdAt}], unreadCount}`; `PUT` with `{id}` or `{markAll: true}` marks read. `NotificationsBell` (header, logged-in only) polls unreadCount (30s) with cinnabar badge + popover feed; `/notifications` page lists all with mark-as-read. Orders completing via Spree checkout `confirm`/`complete` routes fire `notifyOrderCompleted` (dedup by `meta.orderId`, so double-advance confirm→complete never duplicates) — user linkage requires cart `associate` first
- Referral program (`/referral` dashboard): `RefCapture` (client, root layout) reads `?ref=` on ANY page → localStorage `fubao_ref` (30-day expiry) + fires `POST /api/distribution/track {code}` (click counter). Register client auto-attaches the stored code as `referralCode`, which the register route validates via `getUserByReferralCode` and stores as the new user's `referredBy`. Checkout `confirm`/`complete` call `recordOrderCommission` (`lib/distribution/order-commission.ts`): order's user → `referredBy` → `recordCommission` (10% of itemTotal, pending status, dedup via `hasCommissionForOrder`). `GET /api/distribution` returns `{affiliateLink: {code, url, totalClicks, totalConversions, totalEarnings}, stats: {totalEarnings, pendingEarnings, confirmedEarnings, totalConversions}, recentCommissions, withdrawals, config: {commissionRate, minWithdrawAmount}}`; `POST /api/distribution/links` creates/returns the affiliate link (code format FB + name, e.g. FBDEMO01); `POST /distribution/withdraw` (amount ≥ minWithdrawAmount, ≤ pending). Referral share URL is built client-side from `window.location.origin + '?ref=' + code` (never localhost fallback in the display)
- Logged-in checkout association: `checkout/client.tsx` PATCHes `/cart/associate` (session cookie auth) before address step so the order gets a `user_id` — required for the order to appear in `/account` history and receive the completion notification. `resolveRequestUser` in `spree-compat/order-serializer.ts` accepts Bearer JWT OR session cookie (same dual mode as `resolveAccountAuth`); the real Spree client path uses Bearer, the site uses cookies
- Checkout address prefill: `spreeGetDefaultAddress()` (spree/client.ts) fetches `GET /account/addresses` (session cookie, best-effort — returns null on any failure, never throws) and checkout/client.tsx prefills the address form on mount, filling only fields the buyer has NOT typed into (`prev.field || saved.field`; email is never prefilled — it lives on the order, not the address). The compat layer derives the default address from the user's MOST RECENT order with a ship address (`listOrdersForUser` is newest-first), Spree default_address semantics; users without order history start from a blank form
- Social sharing (`components/shared/share-menu.tsx`): `ShareMenu` dropdown — X/Facebook/WhatsApp/Telegram/Email popups + copy-link (clipboard API with `document.execCommand('copy')` fallback + 2s "Link copied" feedback) + `navigator.share` native sheet (mobile, shown only when the API exists). Props: `{path, title, subtitle?, variant?: 'button'|'icon', label?}`; share URL is `window.location.origin + path` resolved in `useEffect` (never hardcoded). Integrated on product detail (icon variant, beside `FavoriteButton`) and article detail (button variant, above "Back to Articles"). Complemented server-side by Open Graph: root layout sets `metadataBase` from `process.env.COZE_PROJECT_DOMAIN_DEFAULT` (fallback `https://fubao.co`), both detail pages export `openGraph.url` (product adds `twitter:card`, article uses `type: 'article'`) so shared links render as rich cards
- Giveaways (`/giveaways`): `getGiveaways()` in `lib/api` wraps `giveaways/giveaway-store.getActiveGiveaways()` in-process for SSR (store itself persists on globalThis, seeds when empty). Page = server shell + `giveaways/client.tsx` (auth-aware claim flow): claim state = `winners.some(w => w.userId === user.id)` checked against `useAuth().user.id`; local optimistic overlay (`claimed` map) bumps the progress count without refetch; states = loading (auth `isLoading` is true during SSR → "Checking eligibility…" shell), not-logged-in (→ `/login`), claimed (→ "Prize claimed", links to notifications), sold out, claimable. `POST /api/giveaways {giveawayId}` requires session, dedupes per user, decrements stock, and fires a `promotion` notification ("Giveaway Prize Claimed", link `/giveaways`) via `createNotification` — visible in the bell + `/notifications`. Entry points: homepage strip (gold-bordered, between Testimonials and CTA) + account Quick Actions. Compliance: page copy frames prizes as cultural keepsakes, "No purchase necessary — for entertainment purposes only"
- Crypto Wallet (`/wallet`): USDT/USDC balance center over the crypto payment rails. Contracts: `GET /api/wallet/balance` → `{data: {USD, USDT, USDC, totalUSD}}`; `POST /api/wallet/topup {amount, currency?, bonus?}` is instant credit (payment-webhook style, returns balance object — NOT a payment ticket); `GET /api/wallet/history` → user's `CryptoPayment[]` newest-first. On-chain deposit flow: `POST /api/crypto/pay {orderId: 'WALLET-…', amount, token, network}` creates an `awaiting_payment` ticket (recipientAddress from `MERCHANT_ADDRESSES`, 30-min expiry) → `POST /api/crypto/verify {orderId, txHash, network}` validates hash per network (TRC20 = 64 hex without 0x, EVM = 0x + 64 hex), confirms, and for `WALLET-`-prefixed orderIds closes the loop in the same response: `completePayment` + `updateWalletBalance` credit the balance — the ONLY `completePayment` caller. `POST /api/crypto/withdraw {token, network, amount, toAddress}` validates the address pattern (`validateAddress`), checks per-token balance + network fee, deducts immediately. Client (`wallet/client.tsx`): token + network pickers with fee hints (`NETWORK_CONFIG` imported from `@/lib/crypto/types` — pure const, client-safe), two-step deposit dialog (address + copy → txHash paste with network-aware placeholder), per-token balance chips, history table with status labels (`STATUS_LABEL`/`STATUS_COLOR` map the real status union incl. `awaiting_payment`). Entry: account Quick Actions → "Crypto Wallet". E2E: unique `WALLET-E2E-{ts}` orderIds per run — the payments Map persists on globalThis and `getPaymentByOrder` returns the FIRST match, so reusing an orderId across runs hits a previous user's payment (403)
- Toasts: sonner `<Toaster position="bottom-right" />` is mounted in root layout (`components/ui/sonner.tsx` wrapper, next-themes aware) — `toast()` from 'sonner' works anywhere in client components (used by giveaways client + referral client)
- Coupon Center (`/coupons`): browsable + claimable coupon hub over the existing coupon engine. Contracts: `GET /api/coupons` returns `{coupons: Coupon[], mine: Coupon[]}` — `coupons` = claimable catalog (is_active + within valid window + usage not exhausted), `mine` = the session user's claimed coupons (empty for anon); `POST /api/coupons {code}` claims via `claimCoupon` (dedup by perUserLimit → 400 "already claimed", invalid/inactive code → 400). Page = server shell + `coupons/client.tsx` (mirror of the giveaways pattern): claim state derived from `mine` codes, local optimistic overlay, not-logged-in → `/login` redirect on claim click, claimable state shows a cinnabar Claim button. Coupon card renders type-aware value (percentage → "10% OFF", fixed → "$5.00 OFF", free_shipping → "Free Shipping"), validity window, and remaining quota bar (used/total + per-user limit). Entry points: account Quick Actions ("Coupon Center") + cart promo section ("Browse coupons" link beside the promo input — claims and cart application stay decoupled: claiming is bookkeeping, applying at checkout uses `PATCH /api/v2/storefront/cart/apply-promo-code {coupon_code}` which re-validates against the live engine)
- Product Reviews (`/talisman/[slug]`): write path over the previously read-only seed reviews. Store: `src/lib/reviews/review-store.ts` on globalThis (`__fubaoReviews`, `StoredReview = Review & {authorId?}` — authorId stays server-side, never serialized); exports `getReviewsForProduct(slug)`, `hasUserReviewed(productSlug, userId)`, `hasVerifiedPurchase(userId, productSlug)` (scans `listOrdersForUser` for `state === 'complete'` orders whose line items contain the slug), `addReview`. API: `POST /api/reviews {productSlug, rating, content}` — session required (401 anon), missing slug → 400, unknown product → 404 (validates against `await getProducts()` from `@/lib/api` — returns a Promise), rating must be 1–5, content ≥ 10 chars, duplicate per user+product → 409 "You have already reviewed this talisman"; success → `{success, data: Review}` with `verifiedPurchase` computed at submission time (frozen flag, not live). UI: `ReviewForm` (client, `components/shared/`) — cinnabar star selector, "Share Your Experience" heading, `router.refresh()` after post so RSC re-aggregates; product detail page computes `ratingSummary {count, average}` from the store (replacing static `product.rating`/`reviewCount`) and renders a gold "Verified Purchase" badge (ShieldCheck, `border-gold/40 bg-jade`) on reviews where `verifiedPurchase` is true. `Review` type carries `verifiedPurchase?: boolean` (`lib/data/types.ts`)
- Wish Wall (`/wishes`): public community wall + moderation loop. Contracts: `GET /api/wishes?page=&limit=` returns ONLY approved wishes (newest-first, `{wishes, pagination: {page, limit, total}}`); `POST /api/wishes {userName, productName, content, rating?}` is public (rate-limited in production), creates `approved: false` wish → 201. The public route deliberately has NO PUT — moderation lives behind auth: `GET /api/admin/wishes` (admin) returns ALL wishes (pending first, then newest approved) + `stats {total, approved, pending, averageRating}`; `PUT /api/admin/wishes {id, approved}` publishes/unpublishes (missing `approved` → 400, unknown id → 404); `DELETE ?id=` removes. Store: `wishes/wish-store.ts` on globalThis (seed-once — re-instantiation must never wipe user submissions). Console `/admin/wishes`: stats cards + pending-first list, approve/unapprove/delete per wish, mirrors the other admin consoles. The wish wall client renders the paginated wall + submit form (optimistic "pending review" note after post); compliance copy frames wishes as community notes on cultural keepsakes

## In-Memory Store Persistence Rule (CRITICAL)

All in-memory stores **MUST** persist their state on `globalThis` — in dev, each route module can be re-instantiated, so module-scoped state is NOT shared across routes (symptom: register succeeds but login can't find the user). Canonical pattern:

```ts
const globalStore = globalThis as unknown as { __fubaoX?: Map<K, V> };
const store: Map<K, V> = (globalStore.__fubaoX ??= new Map());
```

Stores already on globalThis: `spree-compat/order-store`, `auth/user-store` (seed-once guard `__fubaoUsersSeeded`), `coupons/coupon-store` (seeds when empty), `distribution/distribution-store`, `giveaways/giveaway-store` (seeds when empty), `notifications/notification-store` (seed-once via `has()` check), `crypto/payment-store` (demo wallet seeded via `has()` check), `blessing/blessing-store`, `wishes/wish-store` (seed-once), `reviews/review-store` (`__fubaoReviews`, seed-once), `newsletter/newsletter-store`, `api/user/checkin` route (`__fubaoCheckIns`), `api/user/favorites` route (`__fubaoFavorites`), `api/user/history` route (`__fubaoHistory`), and the legacy orders array in `lib/api/index.ts` (`__fubaoLegacyOrders`). `merchant/merchant-store` is a read-only seed array (no mutation APIs) — safe as-is. When adding a new store, follow the same pattern and seed idempotently (guard with a flag or `size === 0` check so re-instantiation never wipes runtime writes).

## Known Auth Patterns (Important)

- `requireAuth(request)` **throws** `'Unauthorized'`; `requireRole(request, role)` **throws** `'Forbidden'` — route handlers must catch and map to 401/403 (see `api/merchant/*`, `api/admin/stats` for the canonical pattern)
- `useAuth()` provides `{ user, isLoading, login, register, logout, refreshUser }` — there is NO `status` field; client guards use `isLoading`/`user`
- Merchant area: login at `/merchant/login` (site auth) → `/merchant/dashboard`; unauthed pages redirect via `?redirect=` param. Merchant role required for `api/merchant/*` (403 otherwise). Demo accounts: merchant@fubao.com / merchant123, admin@fubao.com / admin123
- Admin area: `/admin/dashboard` (role `admin`). Full console: `/admin/dashboard` (stats + nav), `/admin/blessing` (free-blessing campaigns), `/admin/products` (product CRUD), `/admin/orders` (order browser + ship-status), `/admin/coupons` (coupon CRUD), `/admin/giveaways` (campaign CRUD), `/admin/merchants` (application review + withdrawal processing), `/admin/ai-training` + `/admin/knowledge` (AI knowledge base). All admin APIs live under `/api/admin/*` and follow the same pattern: `requireRole('admin')` in try/catch → 401/403 mapping, mutations return `{success, data|message}` with 200, duplicates → 409, invalid input → 400
- Admin product management: `createProductAdmin/updateProductAdmin/deleteProductAdmin` in `lib/data/products.ts` (globalThis-backed catalog with `stock`/`isActive` fields; `is_active` serialized in Spree attributes). Storefront list paths (queries.ts + products route) filter `!isActive`; slug lookups still serve unlisted products. New products get the default protection TalismanSVG variant + standard consecration fields
- Admin coupon/giveaway/merchant mutations live beside their reads: `createCoupon/updateCouponAdmin/deleteCouponAdmin` (coupon-store), `createGiveaway/updateGiveawayAdmin/deleteGiveawayAdmin` (giveaway-store — status `active|upcoming|ended`, ended campaigns vanish from public `/api/giveaways`), `reviewMerchantApplication`/`processMerchantWithdrawalAdmin` (merchant-store; double-review → 400, invalid action → 400)

## Commands

- `pnpm dev` — Start dev server
- `pnpm build` — Production build
- `pnpm ts-check` — TypeScript type checking
- `pnpm lint` — ESLint

## Self-Hosting (BT Panel / 宝塔)

Full deployment guide lives in `宝塔部署教程.md`. Key invariants for any self-hosted production run:

- Entrypoint is the custom server `dist/server.js` (tsup-bundled from `src/server.ts`), NOT `next start`
- `COZE_PROJECT_ENV=PROD` MUST be set — otherwise the custom server prepares Next.js in dev mode
- Env vars are process-injected only (no dotenv auto-load); JWT_SECRET must be replaced from the dev default
- `instances: 1` in PM2 — all stores live on globalThis, multiple instances would fork state
- Nginx reverse proxy needs `proxy_buffering off` for the AI chat SSE stream (`/api/ai/chat` does not set `X-Accel-Buffering`)
- `/api/ai/*`, `/api/upload`, `/api/knowledge/*` depend on sandbox-injected Coze credentials — unavailable on self-hosted servers (expected); set `SPREE_API_URL` to swap the in-memory data layer for a real Spree 5.4 backend

## Extension Points

- Point `SPREE_API_URL` at a real Spree 5.4 instance — routes and frontend switch over without code changes
- Add i18n (currently English only)
- Integrate Stripe for real payments
- Add vendor/multi-merchant support
- Connect image_key to object storage
