# QuickKart — Master Implementation Plan

## Rule (User ka instruction)
> "Jo bhi dynamic karna ho — pehle check karo ki uska data admin panel mein manage hota hai ya nahi.
> Agar hai, toh usi backend se customer API banao aur customer site mein wire karo."

---

## Admin Panel ↔ Backend ↔ Customer Site — Full Mapping

| Customer Feature         | Admin Panel Manages It?  | Admin Route (data source)           | Customer API (already exists)           | Customer File to update                        | Status     |
|--------------------------|--------------------------|-------------------------------------|-----------------------------------------|------------------------------------------------|------------|
| Home banners (carousel)  | ✅ YES — Banners section  | `GET /api/admin/banners`            | `GET /api/app/home` → `banners[]`       | `src/data/banners.ts` → replace with API       | ⏳ Pending  |
| Category grid (home)     | ✅ YES — Catalog > Categories | `GET /api/admin/catalog/categories` | `GET /api/app/home` → `categories[]`   | `src/data/categories.ts` → replace with API    | ⏳ Pending  |
| Product listing          | ✅ YES — Catalog > Products | `GET /api/admin/catalog/products`  | `GET /api/app/products`                 | `src/data/products.ts` → replace with API      | ⏳ Pending  |
| Product detail page      | ✅ YES — Catalog > Products | `GET /api/admin/catalog/products/:id` | `GET /api/app/products/:id`          | `src/features/product/ProductDetailPage.tsx`   | ⏳ Pending  |
| Search                   | ✅ YES — Products          | —                                   | `GET /api/app/products/search?q=`       | `src/features/search/SearchPage.tsx`           | ⏳ Pending  |
| Category page + sidebar  | ✅ YES — Catalog > Categories | —                                | `GET /api/app/categories`               | `src/features/category/CategoryPage.tsx`       | ⏳ Pending  |
| Login / Register         | ✅ YES — Customers section | `GET /api/admin/customers`          | `POST /api/app/auth/login` + `/register`| `src/features/auth/LoginPage.tsx`              | ⏳ Pending  |
| Place Order (cart)       | ✅ YES — Orders section    | `GET /api/admin/orders`             | `POST /api/app/orders`                  | `src/features/cart/CartPage.tsx`               | ⏳ Pending  |
| Order history            | ✅ YES — Orders section    | `GET /api/admin/orders`             | `GET /api/app/orders`                   | new: `src/features/orders/OrdersPage.tsx`      | ⏳ Pending  |
| Track order              | ✅ YES — Orders > Status   | `PATCH /api/admin/orders/:id/status`| `GET /api/app/orders/:id` → `timeline` | new: `src/features/orders/OrderDetailPage.tsx` | ⏳ Pending  |
| Coupon code              | ✅ YES — Coupons section   | `GET /api/admin/coupons`            | `POST /api/app/coupons/validate`        | `src/features/cart/CartPage.tsx`               | ⏳ Pending  |
| Wallet balance           | ✅ YES — Wallet section    | `GET /api/admin/wallet`             | `GET /api/app/wallet`                   | new: `src/features/profile/WalletPage.tsx`     | ⏳ Pending  |
| Saved addresses          | ❌ NO admin UI (user-only) | —                                   | `GET/POST/PUT/DELETE /api/app/addresses`| new: `src/features/profile/AddressesPage.tsx`  | ⏳ Pending  |
| Profile page             | ✅ YES — Customers section | `GET /api/admin/customers/:id`      | `GET/PUT /api/app/profile`              | new: `src/features/profile/ProfilePage.tsx`    | ⏳ Pending  |

---

## Implementation Order (Priority)

### Phase 1 — Foundation (karo pehle)
1. **Auth store setup** — token save/load from localStorage
2. **API client** — axios instance with base URL + auth header auto-attach
3. **Login/Register wiring** — form submit → real API → token store

### Phase 2 — Public pages (no login needed)
4. **Home page** — `GET /api/app/home` → banners + categories + featured
5. **Category page** — `GET /api/app/categories` → sidebar
6. **Product listing** — `GET /api/app/products?category_id=X`
7. **Product detail** — `GET /api/app/products/:id`
8. **Search** — `GET /api/app/products/search?q=`

### Phase 3 — Protected pages (login required)
9. **Cart → Place Order** — `POST /api/app/orders`
10. **Apply Coupon** — `POST /api/app/coupons/validate`
11. **Order History** — `GET /api/app/orders`
12. **Order Tracking** — `GET /api/app/orders/:id`
13. **Profile page** — `GET/PUT /api/app/profile`
14. **Addresses** — full CRUD `/api/app/addresses`
15. **Wallet** — `GET /api/app/wallet`

---

## Files to Create

### Infrastructure
- `src/lib/api.ts` — axios instance (base URL, auth header)
- `src/store/authStore.ts` — zustand store (token, user, login/logout)
- `src/hooks/useAuth.ts` — helper hook

### Feature pages (new)
- `src/features/orders/OrdersPage.tsx`
- `src/features/orders/OrderDetailPage.tsx`
- `src/features/profile/ProfilePage.tsx`
- `src/features/profile/AddressesPage.tsx`
- `src/features/profile/WalletPage.tsx`

---

## What Admin Panel Controls (Customer sees the effect)

```
Admin adds a Banner     →  Customer sees it in home carousel
Admin adds a Product    →  Customer can buy it
Admin adds a Category   →  Customer sees it in sidebar + home grid
Admin creates a Coupon  →  Customer can use it at checkout
Admin updates order status → Customer sees it in order tracking timeline
Admin toggles product active/inactive → Product disappears from customer site
```

This is the **live data flow** — admin panel is the CMS, customer site is the storefront.
