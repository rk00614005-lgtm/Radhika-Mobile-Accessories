# Security Specification: Radhika Mobile Accessories Firestore Security Rules

## 1. Data Invariants
1. **Product Protection:** Products can be viewed by all visitors (`read: if true`), but creating, updating, or deleting products (including price, stock, discounts, images) is strictly restricted to store administrators (`isAdmin()`). Non-admins or unauthenticated users cannot alter the catalog.
2. **Category Protection:** Categories are publicly readable, but write/update/delete operations are restricted to store administrators.
3. **Order Access Control:**
   - Anyone (authenticated users or guest checkout) can place an order (`create: if true`).
   - Authenticated customers can read and list their own orders where `resource.data.userId == request.auth.uid`.
   - Store administrators can read and list all orders.
   - Order status and fulfillment details can ONLY be modified by administrators (`update: if isAdmin()`). Customers cannot change prices, paymentStatus, or orderStatus.
4. **Coupon Protection:** Active coupons can be read by customers to calculate discounts, but coupon creation, editing, and deletion are restricted to administrators.
5. **Review Invariant:** Reviews are publicly readable. Reviews can be posted by signed-in users or verified purchasers, but modifying or deleting existing reviews is restricted to their author or store administrators.
6. **Gallery Invariant:** Photos of the shop and inventory are publicly viewable, but modifying gallery metadata is restricted to administrators.
7. **Contact Inquiries:** Any visitor can submit a contact inquiry, but only store administrators can view submitted inquiries (`read: if isAdmin()`).
8. **Admin Role Isolation:** Normal customers cannot assign themselves the admin role or modify the `/admins` collection.

---

## 2. The "Dirty Dozen" Malicious Payloads

1. **Payload 1: Price Tampering Attack**
   - Target: `/products/{productId}` (update)
   - Attack: Ordinary customer attempts to change iPhone Case price from ₹499 to ₹1.
   - Expected Result: `PERMISSION_DENIED`

2. **Payload 2: Stock Counter Wipeout**
   - Target: `/products/{productId}` (delete)
   - Attack: Unauthenticated visitor attempts to delete product records.
   - Expected Result: `PERMISSION_DENIED`

3. **Payload 3: Unauthorized Product Injection**
   - Target: `/products/{productId}` (create)
   - Attack: Normal user submits a new fake product listing.
   - Expected Result: `PERMISSION_DENIED`

4. **Payload 4: Privilege Escalation Attack**
   - Target: `/admins/{userId}` (create/update)
   - Attack: Ordinary user attempts to write their own UID into `/admins` collection.
   - Expected Result: `PERMISSION_DENIED`

5. **Payload 5: Order Snooping (PII Breach)**
   - Target: `/orders/{orderId}` (get/list)
   - Attack: User A queries or reads Order belonging to User B (`userId: 'user-b'`).
   - Expected Result: `PERMISSION_DENIED`

6. **Payload 6: Order Status Forgery**
   - Target: `/orders/{orderId}` (update)
   - Attack: Customer attempts to change their own unpaid order `paymentStatus` to 'PAID' or `orderStatus` to 'DELIVERED'.
   - Expected Result: `PERMISSION_DENIED`

7. **Payload 7: Coupon Forgery Attack**
   - Target: `/coupons/{couponId}` (create)
   - Attack: Customer attempts to create a 99% off coupon code 'HACK99'.
   - Expected Result: `PERMISSION_DENIED`

8. **Payload 8: Contact Inquiries Scraping**
   - Target: `/contact_messages/{messageId}` (list/get)
   - Attack: Anonymous user attempts to read phone numbers and messages of store customers.
   - Expected Result: `PERMISSION_DENIED`

9. **Payload 9: Ghost Field Injection (Shadow Update)**
   - Target: `/users/{userId}` (update)
   - Attack: User updates their profile with injected `isAdmin: true` or `role: 'ADMIN'` property.
   - Expected Result: `PERMISSION_DENIED`

10. **Payload 10: Oversized Payload Attack (Denial of Wallet)**
    - Target: `/contact_messages/{messageId}` (create)
    - Attack: Attacker sends a 10MB spam message in the message field.
    - Expected Result: `PERMISSION_DENIED` (enforces `.size() <= 4000`)

11. **Payload 11: Malicious ID Injection**
    - Target: `/products/{productId}`
    - Attack: Attacker crafts a path with invalid symbols / control characters / 500-byte length.
    - Expected Result: `PERMISSION_DENIED` (enforces `isValidId`)

12. **Payload 12: Gallery Defacement Attack**
    - Target: `/gallery/{galleryId}` (create/delete)
    - Attack: Non-admin replaces storefront photo URL with malicious external link.
    - Expected Result: `PERMISSION_DENIED`
