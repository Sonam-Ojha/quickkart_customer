# QuickKart Customer API Documentation

**Base URL:** `http://localhost:4000/api/app`  
**Frontend proxy:** Vite proxies `/api` → `http://localhost:4000`, so use `/api/app/...` in frontend code.

---

## Authentication

### Token Rules
- Public routes (no token needed): Home feed, Products list, Product detail, Categories, Search
- Protected routes (token required): Orders, Addresses, Wallet, Coupons, Profile
- Send token in header: `Authorization: Bearer <token>`
- Token expires in **30 days**

---

## 1. Auth — `/api/app/auth`

### POST `/api/app/auth/register`
Register a new customer account.

**Request Body:**
```json
{
  "name":     "Sonam Ojha",
  "phone":    "9876543210",
  "email":    "sonam@email.com",
  "password": "mypassword123"
}
```

**Response 201:**
```json
{
  "token": "eyJhbGci...",
  "user": {
    "id":    1,
    "name":  "Sonam Ojha",
    "phone": "9876543210"
  }
}
```

**Error 409:** `{ "message": "Phone already registered" }`

---

### POST `/api/app/auth/login`
Login with phone + password.

**Request Body:**
```json
{
  "phone":    "9876543210",
  "password": "mypassword123"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGci...",
  "user": {
    "id":            1,
    "name":          "Sonam Ojha",
    "phone":         "9876543210",
    "walletBalance": 250.00
  }
}
```

**Error 401:** `{ "message": "Invalid credentials" }`

---

### POST `/api/app/auth/refresh`
Get a fresh token (e.g. on app startup if token is about to expire).

**Request Body:**
```json
{ "userId": 1 }
```

**Response 200:**
```json
{ "token": "eyJhbGci..." }
```

---

## 2. Home Feed — `/api/app/home`

### GET `/api/app/home`
Returns banners + category grid + featured products for the home page.  
**Auth:** Optional (public)

**Response 200:**
```json
{
  "banners": [
    {
      "id":            1,
      "title":         "Fresh Vegetables",
      "image_url":     "https://...",
      "link":          "/category?tab=Fresh",
      "display_order": 1,
      "is_active":     true
    }
  ],
  "categories": [
    {
      "id":        1,
      "name":      "Fresh",
      "image_url": "https://...",
      "is_active": true
    }
  ],
  "featured": [
    {
      "id":             "p1",
      "name":           "Organic Tomatoes",
      "price":          49,
      "mrp":            65,
      "image_url":      "https://...",
      "weight":         "500g",
      "category_id":    1,
      "category": { "id": 1, "name": "Fresh" }
    }
  ]
}
```

---

## 3. Products — `/api/app/products`

### GET `/api/app/products`
List all active products. Supports filtering + pagination.  
**Auth:** Optional (public)

**Query Params:**

| Param         | Type   | Default | Description                     |
|---------------|--------|---------|---------------------------------|
| `category_id` | number | —       | Filter by category               |
| `limit`       | number | 20      | Items per page                   |
| `offset`      | number | 0       | Skip N items (for pagination)    |

**Example:** `/api/app/products?category_id=2&limit=12&offset=0`

**Response 200:**
```json
{
  "products": [
    {
      "id":          "p1",
      "name":        "Amul Milk",
      "price":       28,
      "mrp":         30,
      "image_url":   "https://...",
      "weight":      "500ml",
      "is_active":   true,
      "category_id": 2,
      "category":    { "id": 2, "name": "Dairy" }
    }
  ],
  "total": 45
}
```

---

### GET `/api/app/products/search`
Search products by name.  
**Auth:** Optional (public)

**Query Params:**

| Param   | Type   | Default | Description          |
|---------|--------|---------|----------------------|
| `q`     | string | —       | Search keyword       |
| `limit` | number | 20      | Max results to return|

**Example:** `/api/app/products/search?q=milk&limit=10`

**Response 200:** Array of matching products (same shape as list)
```json
[ { "id": "p1", "name": "Amul Milk", ... } ]
```

---

### GET `/api/app/products/:id`
Get single product detail.  
**Auth:** Optional (public)

**Example:** `/api/app/products/p1`

**Response 200:**
```json
{
  "id":          "p1",
  "name":        "Amul Milk",
  "price":       28,
  "mrp":         30,
  "image_url":   "https://...",
  "weight":      "500ml",
  "description": "Fresh toned milk",
  "is_active":   true,
  "category":    { "id": 2, "name": "Dairy" }
}
```

**Error 404:** `{ "message": "Product not found" }`

---

## 4. Categories — `/api/app/categories`

### GET `/api/app/categories`
List all active categories.  
**Auth:** Optional (public)

**Response 200:**
```json
[
  { "id": 1, "name": "Fresh",     "image_url": "https://...", "is_active": true },
  { "id": 2, "name": "Dairy",     "image_url": "https://...", "is_active": true },
  { "id": 3, "name": "Snacks",    "image_url": "https://...", "is_active": true },
  { "id": 4, "name": "Beverages", "image_url": "https://...", "is_active": true }
]
```

---

### GET `/api/app/categories/:id/products`
Get all products in a specific category.  
**Auth:** Optional (public)

**Query Params:** `limit` (default 20), `offset` (default 0)

**Response 200:**
```json
{
  "category": { "id": 1, "name": "Fresh" },
  "products":  [ { "id": "p1", "name": "Tomatoes", ... } ],
  "total":     12
}
```

---

## 5. Orders — `/api/app/orders`
🔒 **All routes require auth token**

### GET `/api/app/orders`
Get current user's order history.

**Response 200:**
```json
[
  {
    "id":             101,
    "status":         "delivered",
    "total_amount":   349,
    "delivery_fee":   0,
    "payment_method": "cod",
    "created_at":     "2026-06-20T10:30:00Z",
    "items": [
      {
        "id":          1,
        "qty":         2,
        "unit_price":  49,
        "total_price": 98,
        "product": { "id": "p1", "name": "Organic Tomatoes", "image_url": "https://..." }
      }
    ]
  }
]
```

---

### POST `/api/app/orders`
Place a new order.

**Request Body:**
```json
{
  "items": [
    { "product_id": "p1", "qty": 2, "price": 49 },
    { "product_id": "p5", "qty": 1, "price": 120 }
  ],
  "address_id":     3,
  "coupon_code":    "SAVE10",
  "payment_method": "cod"
}
```

> `payment_method` options: `"cod"` | `"upi"` | `"card"` | `"wallet"`  
> Delivery fee is auto-calculated: **₹0 if subtotal ≥ ₹99, else ₹25**  
> Handling charge: **₹5** (always added)

**Response 201:**
```json
{
  "id":             102,
  "status":         "pending",
  "total_amount":   247,
  "delivery_fee":   25,
  "payment_method": "cod",
  "created_at":     "2026-06-21T11:00:00Z"
}
```

---

### GET `/api/app/orders/:id`
Get single order detail with timeline.

**Response 200:**
```json
{
  "id":             102,
  "status":         "out_for_delivery",
  "total_amount":   247,
  "items": [ ... ],
  "timeline": [
    { "status": "pending",          "note": "Order placed",         "created_at": "..." },
    { "status": "confirmed",        "note": "Order confirmed",       "created_at": "..." },
    { "status": "out_for_delivery", "note": "Rider picked up order", "created_at": "..." }
  ]
}
```

---

## 6. Addresses — `/api/app/addresses`
🔒 **All routes require auth token**

### GET `/api/app/addresses`
List all saved addresses for the logged-in user.

**Response 200:**
```json
[
  {
    "id":         3,
    "label":      "Home",
    "line1":      "B-12, Sector 18",
    "line2":      "Near Metro Station",
    "city":       "Noida",
    "state":      "Uttar Pradesh",
    "pincode":    "201301",
    "lat":        28.5706,
    "lng":        77.3261,
    "is_default": true
  }
]
```

---

### POST `/api/app/addresses`
Add a new delivery address.

**Request Body:**
```json
{
  "label":      "Home",
  "line1":      "B-12, Sector 18",
  "line2":      "Near Metro Station",
  "city":       "Noida",
  "state":      "Uttar Pradesh",
  "pincode":    "201301",
  "lat":        28.5706,
  "lng":        77.3261,
  "is_default": true
}
```

**Response 201:** Created address object

---

### PUT `/api/app/addresses/:id`
Update an existing address. Send only fields you want to update.

**Response 200:** Updated address object  
**Error 404:** `{ "message": "Address not found" }`

---

### DELETE `/api/app/addresses/:id`
Delete an address.

**Response 200:** `{ "message": "Deleted" }`

---

## 7. Wallet — `/api/app/wallet`
🔒 **All routes require auth token**

### GET `/api/app/wallet`
Get wallet balance + 5 recent transactions.

**Response 200:**
```json
{
  "balance": 250.00,
  "recentTransactions": [
    {
      "id":          1,
      "type":        "credit",
      "amount":      50,
      "description": "Refund for Order #98",
      "created_at":  "2026-06-18T14:00:00Z"
    }
  ]
}
```

---

### GET `/api/app/wallet/history`
Full wallet transaction history with pagination.

**Query Params:** `limit` (default 20), `offset` (default 0)

**Response 200:**
```json
{
  "transactions": [ ... ],
  "total": 12
}
```

---

## 8. Coupons — `/api/app/coupons`
🔒 **All routes require auth token**

### POST `/api/app/coupons/validate`
Validate a coupon code and get the discount amount.

**Request Body:**
```json
{
  "code":     "SAVE10",
  "subtotal": 250
}
```

**Response 200 (valid):**
```json
{
  "valid":    true,
  "discount": 25,
  "coupon": {
    "code":  "SAVE10",
    "type":  "percent",
    "value": 10
  }
}
```

> `type` can be `"percent"` (value is %) or `"flat"` (value is ₹)

**Error responses:**
- `404` — `{ "message": "Invalid coupon code" }`
- `400` — `{ "message": "Coupon has expired" }`
- `400` — `{ "message": "Minimum order amount is ₹199" }`
- `400` — `{ "message": "You have already used this coupon" }`

---

## 9. Profile — `/api/app/profile`
🔒 **All routes require auth token**

### GET `/api/app/profile`
Get logged-in customer's profile.

**Response 200:**
```json
{
  "id":             1,
  "name":           "Sonam Ojha",
  "phone":          "9876543210",
  "email":          "sonam@email.com",
  "wallet_balance": 250.00,
  "referral_code":  "SONAM123",
  "created_at":     "2026-01-15T08:00:00Z"
}
```

---

### PUT `/api/app/profile`
Update name and/or email.

**Request Body:**
```json
{
  "name":  "Sonam Ojha Updated",
  "email": "newemail@email.com"
}
```

**Response 200:**
```json
{
  "id":    1,
  "name":  "Sonam Ojha Updated",
  "email": "newemail@email.com"
}
```

---

## Error Format (All routes)
```json
{ "message": "Error description here" }
```

| Status | Meaning                          |
|--------|----------------------------------|
| 200    | Success                          |
| 201    | Created successfully             |
| 400    | Bad request / validation failed  |
| 401    | Not logged in / invalid token    |
| 404    | Resource not found               |
| 409    | Conflict (e.g. phone exists)     |
| 500    | Server error                     |

---

## Frontend Integration Map

| Feature                  | API to call                                      |
|--------------------------|--------------------------------------------------|
| Home page banners+grid   | `GET /api/app/home`                              |
| Product listing          | `GET /api/app/products?category_id=X`            |
| Search bar               | `GET /api/app/products/search?q=milk`            |
| Product detail page      | `GET /api/app/products/:id`                      |
| Category sidebar list    | `GET /api/app/categories`                        |
| Category products        | `GET /api/app/categories/:id/products`           |
| Login form               | `POST /api/app/auth/login`                       |
| Register form            | `POST /api/app/auth/register`                    |
| Place order (cart page)  | `POST /api/app/orders`                           |
| Order history            | `GET /api/app/orders`                            |
| Track order              | `GET /api/app/orders/:id`                        |
| Saved addresses          | `GET /api/app/addresses`                         |
| Add address              | `POST /api/app/addresses`                        |
| Wallet balance           | `GET /api/app/wallet`                            |
| Apply coupon             | `POST /api/app/coupons/validate`                 |
| My profile               | `GET /api/app/profile`                           |
| Update profile           | `PUT /api/app/profile`                           |

---

## Next Steps — Wiring Frontend to Backend

1. **Auth:** Connect `LoginPage.tsx` to `POST /api/app/auth/login` — store token in `localStorage`
2. **Home:** Replace mock `banners` + `products` data with `GET /api/app/home` response
3. **Categories:** Replace `homeCategories` mock with `GET /api/app/categories`
4. **Products:** Replace `data/products.ts` mock with real API calls in `CategoryPage` + `HomePage`
5. **Search:** Connect `SearchPage.tsx` to `GET /api/app/products/search?q=...`
6. **Cart → Order:** On checkout, call `POST /api/app/orders` with cart items
7. **Coupon:** Connect cart coupon input to `POST /api/app/coupons/validate`
8. **Profile:** Build profile page using `GET/PUT /api/app/profile`
