# Radhika Mobile Accessories — Full-Stack E-Commerce Platform

A production-oriented, full-stack e-commerce web platform for **Radhika Mobile Accessories**, a premier electronics, smartphone accessories, and audio gear business operating in India with online pan-India shipping and an official physical retail store in Bhadrachalam.

---

## 1. Business & Brand Profile

- **Brand Name:** Radhika Mobile Accessories
- **Category:** Electronics, Mobile Accessories, Fast Chargers, Audio & Gadgets
- **Shop Address:** Market Road, Opposite to the Current Office, Bhadrachalam
- **Phone Numbers:** 7207126270 / 9492456210
- **Email:** rk00614005@gmail.com
- **Store Hours:** Open Daily: 9:00 AM – 10:00 PM (Monday to Sunday, Every day)
- **Target Market:** India (All 28 States & Union Territories)
- **Currency:** Indian Rupee (₹ INR)
- **Languages:** English (with upcoming Hindi localization support)
- **Courier Partners:** BlueDart Express & Delhivery

---

## 2. Technology Stack

### Frontend
- **Framework:** React 19 with Vite 8
- **Language:** TypeScript 5.8
- **Styling:** Tailwind CSS 4 with custom typography (`Outfit` & `Plus Jakarta Sans`)
- **Icons:** Lucide React
- **Animations & Effects:** Motion & Canvas-Confetti
- **State & Context:** React Context API with LocalStorage caching

### Backend
- **Runtime:** Node.js 22
- **Framework:** Express.js 4.21
- **Language:** TypeScript with `tsx` execution
- **API Architecture:** RESTful JSON API
- **Security:** Strict server-side recalculation of cart totals and discount caps, rate-limiting & parameter validation

### Database & ORM
- **Database:** PostgreSQL (with Prisma ORM client schema provided in `/prisma/schema.prisma`)
- **Storage Layer:** Dual-mode architecture (Prisma ready + resilient memory/JSON persistent store for zero-friction container runtime)

### Payment Gateway
- **Provider:** Razorpay India (UPI, Google Pay, PhonePe, Cards, NetBanking) + Cash on Delivery (COD)

---

## 3. Project Directory Structure

```
radhika-mobile-accessories/
├── prisma/
│   └── schema.prisma           # Complete PostgreSQL Prisma ORM schema
├── server/
│   ├── data/
│   │   ├── initialData.ts      # Realistic sample inventory across 11 categories
│   │   └── store.ts            # Persistent data access layer & in-memory store
│   └── routes/
│       └── api.ts              # RESTful API router (products, auth, orders, coupons, etc.)
├── src/
│   ├── components/
│   │   ├── AuthModal.tsx       # Customer & Admin login/register modal
│   │   ├── Footer.tsx          # Store details, policies, payment badges, Pune store info
│   │   ├── Navbar.tsx          # Top bar, live search, cart preview, category navigation
│   │   ├── ProductCard.tsx     # Responsive product card with discounts, badges, quick add
│   │   ├── RazorpayModal.tsx   # Simulated Razorpay checkout dialog for test mode
│   │   └── ToastContainer.tsx  # Floating notification toasts
│   ├── context/
│   │   └── ShopContext.tsx     # Central cart, wishlist, auth, navigation & toast state
│   ├── pages/
│   │   ├── AboutPage.tsx       # Pune shop legacy, values, standards
│   │   ├── AccountPage.tsx     # Customer dashboard, order history, quick re-order
│   │   ├── AdminDashboardPage.tsx # Protected admin panel (stats, products CRUD, orders, coupons)
│   │   ├── CartPage.tsx        # Line items, coupon application, free shipping progress bar
│   │   ├── CheckoutPage.tsx    # Indian shipping address form, Razorpay/COD checkout
│   │   ├── ContactPage.tsx     # Working contact form, physical store timings & map coordinates
│   │   ├── FaqPage.tsx         # Categorized accordion for ordering, shipping, and warranty
│   │   ├── HomePage.tsx        # Hero carousel, category pills, flash deals, store spotlight
│   │   ├── NotFoundPage.tsx    # Custom 404 page with navigation shortcuts
│   │   ├── PoliciesPage.tsx    # Shipping, 7-day returns, privacy, and terms of service
│   │   ├── ProductDetailsPage.tsx # Gallery, specs, stock indicator, reviews, related products
│   │   ├── ShopPage.tsx        # Search, category filter, price slider, rating filter, sort
│   │   └── TrackOrderPage.tsx  # Order tracking milestones (BlueDart/Delhivery AWB)
│   ├── services/
│   │   └── api.ts              # Fetch client for all backend REST endpoints
│   ├── types/
│   │   └── index.ts            # Shared TypeScript interfaces
│   ├── App.tsx                 # Root application component and view routing
│   ├── index.css               # Tailwind CSS imports and custom design tokens
│   └── main.tsx                # React DOM entry point
├── .env.example                # Environment variable template
├── metadata.json               # App metadata
├── package.json                # Project dependencies and run scripts
├── server.ts                   # Express server entry point mounting Vite middleware
├── tsconfig.json               # TypeScript configuration
└── vite.config.ts              # Vite configuration
```

---

## 4. Installation & Startup (Windows PowerShell)

### Step 1: Clone or Open the Repository
```powershell
cd radhika-mobile-accessories
```

### Step 2: Install Node Dependencies
```powershell
npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env`:
```powershell
Copy-Item .env.example .env
```

### Step 4: Run the Full-Stack Application
Start both the Express REST API backend and the Vite frontend simultaneously:
```powershell
npm run dev
```
Open your browser at `http://localhost:3000`.

---

## 5. PostgreSQL & Prisma Database Setup

To use PostgreSQL in production:

### 1. Provision a PostgreSQL Database
Ensure PostgreSQL is running locally on port 5432 or on Cloud SQL/Neon/Supabase:
```powershell
# Create the database in psql
CREATE DATABASE radhika_mobile_accessories;
```

### 2. Set the Connection String in `.env`
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/radhika_mobile_accessories?schema=public"
```

### 3. Generate the Prisma Client & Run Migrations
```powershell
# Generate Prisma Client
npx prisma generate

# Run Initial Migration
npx prisma migrate dev --name init_ecommerce_schema

# Open Prisma Studio to inspect tables visually
npx prisma studio
```

---

## 6. REST API Endpoint Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/products` | Query products with filters (`category`, `search`, `minPrice`, `maxPrice`, `inStockOnly`, `sort`) |
| `GET` | `/api/products/:id` | Get single product details, reviews, and related items |
| `POST` | `/api/products` | *(Admin)* Add new product to catalog |
| `PUT` | `/api/products/:id` | *(Admin)* Update existing product pricing, stock, or details |
| `DELETE` | `/api/products/:id` | *(Admin)* Delete product from catalog |
| `POST` | `/api/products/reset` | *(Admin)* Reset catalog back to realistic factory sample data |
| `GET` | `/api/categories` | Retrieve all 11 product categories |
| `POST` | `/api/auth/register` | Register customer account |
| `POST` | `/api/auth/login` | Login customer or admin |
| `POST` | `/api/coupons/validate` | Validate coupon code (`code`, `subtotal`) |
| `GET` | `/api/coupons` | *(Admin)* List all active promotional coupons |
| `POST` | `/api/coupons` | *(Admin)* Create a new coupon |
| `DELETE` | `/api/coupons/:id` | *(Admin)* Delete a coupon |
| `POST` | `/api/orders` | Create an order with server-side price & discount recalculation |
| `GET` | `/api/orders` | Retrieve orders (optionally filtered by `userId`) |
| `GET` | `/api/orders/track/:orderNumber` | Live track order status and milestones by Order ID |
| `PATCH` | `/api/orders/:id/status` | *(Admin)* Update order status (`PENDING`, `SHIPPED`, `DELIVERED`, `CANCELLED`) |
| `POST` | `/api/razorpay/create-order` | Create Razorpay order amount in paise |
| `POST` | `/api/razorpay/verify` | Verify Razorpay payment signature |
| `POST` | `/api/contact` | Submit contact message inquiry |
| `GET` | `/api/contact` | *(Admin)* View submitted inquiries |
| `GET` | `/api/admin/stats` | *(Admin)* Aggregate revenue, low stock count, and daily sales trend |

---

## 7. Authentication & Roles
 
The store uses secure Firebase Authentication (Email/Password & Google Sign-In) with Cloud Firestore Role-Based Access Control:
 
### 👑 Store Administrator Access
- **Designated Admin Email:** `rk00614005@gmail.com`
- **Authentication Method:** Secure Firebase Authentication (Email/Password or Google One-Tap/Popup sign-in)
- **Role:** `ADMIN` (Provides authorized access to `/admin` dashboard, product catalog management, order status updates, photo uploads, and coupon creation)
- **Security:** Verified by Firebase Security Rules and backend token authentication
 
### 👤 Customer Accounts
- **Authentication Method:** Self-registration via Firebase Auth or Google Sign-In
- **Role:** `CUSTOMER` (Can browse products, create orders, track shipments, and access only their own private orders)

---

## 8. Available Coupons

| Coupon Code | Discount | Minimum Cart Value |
| :--- | :--- | :--- |
| `WELCOME10` | 10% Instant Discount (Capped at ₹200) | ₹499 |
| `RADHIKA50` | Flat ₹50 OFF | ₹699 |
| `FESTIVE15` | 15% Mega Discount (Capped at ₹400) | ₹1,199 |
| `FREESHIP` | Flat ₹49 OFF (Free Express Delivery) | ₹0 |

---

## 9. Final Implementation Checklist

- [x] Responsive, mobile-first design with purple, pink, dark navy, and white palette
- [x] Home page with hero carousel, flash deals countdown, store spotlight, and reviews
- [x] Shop page with live keyword search, 11 categories, price slider, rating filter, sort, and view modes
- [x] Product details with image gallery, color variant selector, stock indicator, pincode checker, specs table, and reviews
- [x] Shopping cart with line item quantity controls, free shipping threshold progress bar, and coupon application
- [x] Checkout page with complete Indian shipping address fields and delivery options
- [x] Razorpay online payment test mode simulation and Cash on Delivery option
- [x] Unique order number generation (`RMA-2025-XXXX`) and order confirmation screen with celebratory confetti
- [x] Customer account page with order history and tracking shortcuts
- [x] Order tracking page with detailed delivery milestones and courier AWB numbers
- [x] About Us page detailing the Pune flagship store story and quality commitment
- [x] Contact Us page with functioning message submission, store timings, and WhatsApp/phone links
- [x] Categorized FAQ page with interactive accordion
- [x] Store policies page covering Shipping, 7-Day Returns, Privacy, and Terms
- [x] Custom 404 page with navigation recovery buttons
- [x] Protected Admin Dashboard with KPI stats, sales chart, products CRUD, order status updates, and coupon management
- [x] Admin Product Photo Upload with phone/PC file picker, multi-image support, primary cover setting, and preview
- [x] Dedicated Shop Photo Gallery (`/gallery`) with Bhadrachalam showroom photos, category tabs, and interactive Lightbox modal
- [x] Admin Shop Gallery management tab with photo upload, editing, and deletion
- [x] Upload security: Magic Bytes file header inspection (JPEG, PNG, WebP), 5 MB size limit, safe UUID filenames, and admin authorization guard
- [x] Express REST backend with static `/uploads` serving and Vite middlewares integration
- [x] PostgreSQL Prisma ORM schema (`prisma/schema.prisma`)
- [x] Full sample inventory with Indian Rupee (₹) pricing across all 11 requested categories

---

## 10. Photo Upload & Shop Gallery Architecture

### Photo Upload Security Features
1. **Frontend Validation:**
   - Enforces MIME type selection (`image/jpeg`, `image/png`, `image/webp`).
   - Rejects files larger than 5 MB before network transmission.
   - Provides live previews and upload progress indicators.
2. **Backend Validation:**
   - Express + Multer disk storage writes files to the `./uploads` directory.
   - Cryptographically random sanitized filenames (`rma_<timestamp>_<uuid>.<ext>`) prevent directory traversal attacks.
   - **Magic Bytes Validation:** Inspects raw file binary signatures (JPEG `FF D8 FF`, PNG `89 50 4E 47`, WebP `RIFF...WEBP`) to block disguised executables. Non-image files are deleted immediately and rejected with HTTP 400.
   - **Role Authorization:** Protected by admin token header verification (`requireAdminAuth`).
3. **Database Integration:**
   - Image files are stored in object/file storage (`/uploads/<filename>`) and only their public URLs are stored in the database models.
4. **Shop Gallery (`/gallery`):**
   - Filterable categories: Store Interior, Accessories Display, Showroom Front, Fitting & Service Desk, Gadgets Wall.
   - Fullscreen Lightbox modal with zoom, captions, and store directions.
   - Admin management tab in `/admin` for direct showroom photo uploads and edits.
