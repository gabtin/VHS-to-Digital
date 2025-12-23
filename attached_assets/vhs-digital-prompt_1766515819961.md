# AI Coding Agent Prompt: VHS-to-Digital Service Platform

## Project Overview

Build a full-stack web platform for a VHS-to-digital conversion service called **"ReelRevive"** (or similar memorable name). The platform consists of two parts: a customer-facing website for browsing services, configuring orders, and checking out, and an admin dashboard for order management, customer communication, and fulfillment operations.

**Tech Stack Requirements:**
- **Frontend:** Next.js 14+ (App Router) with TypeScript
- **Styling:** Tailwind CSS with a clean, minimalist design system
- **Backend:** Next.js API routes + Prisma ORM
- **Database:** PostgreSQL (via Supabase or Railway)
- **Authentication:** NextAuth.js with Google and Facebook OAuth providers
- **Payments:** Stripe Checkout + Stripe webhooks for order confirmation
- **Email:** Resend or SendGrid for transactional emails
- **Shipping Labels:** EasyPost API or ShipStation API integration
- **Hosting:** Vercel (frontend) + managed PostgreSQL

---

## Part 1: Customer-Facing Website

### 1.1 Design Philosophy

Create a minimalist, trust-inspiring design that appeals to customers who may be less tech-savvy (often dealing with precious family memories). The design should feel:
- **Clean and uncluttered** — generous whitespace, clear typography
- **Warm and nostalgic** — subtle nods to VHS era (muted retro colors as accents, perhaps a subtle film grain texture on hero sections)
- **Professional and trustworthy** — clear pricing, transparent process, visible contact info
- **Accessible** — WCAG 2.1 AA compliant, readable fonts (16px minimum body text), high contrast

**Color Palette Suggestion:**
- Primary: Deep navy (#1a2744) or charcoal
- Accent: Warm amber/gold (#e8a838) — reminiscent of VHS tape spools
- Background: Off-white (#fafafa) with subtle warmth
- Text: Near-black (#1a1a1a) for readability

**Typography:**
- Headings: A clean geometric sans-serif (Inter, Plus Jakarta Sans)
- Body: Same family, regular weight for excellent readability

---

### 1.2 Site Structure & Pages

#### 1.2.1 Homepage (`/`)

**Hero Section:**
- Compelling headline: "Your Memories Deserve a Second Life" or "Bring Your VHS Tapes Into the Digital Age"
- Subheadline explaining the service in one sentence
- Primary CTA button: "Get Started — Free Quote" (links to configurator)
- Secondary CTA: "See How It Works"
- Hero image/video: Tasteful imagery of VHS tapes transforming into digital files, or a family watching old footage on modern devices

**How It Works Section:**
A horizontal stepper or card layout showing 4 steps:
1. **Configure** — Tell us about your tapes
2. **Ship** — Send your tapes using our prepaid label
3. **We Digitize** — Professional conversion with quality checks
4. **Receive** — Get digital files + optional tape return

**Trust Indicators Section:**
- Number of tapes converted (e.g., "50,000+ tapes converted")
- Customer testimonials (3 cards with photos, names, short quotes)
- Security/privacy badge: "Your memories never leave our secure facility"
- Satisfaction guarantee badge

**Pricing Preview Section:**
- Simple pricing table showing starting prices
- "Starting at $X per tape" with brief explanation
- CTA to full pricing page or configurator

**FAQ Accordion:**
- 5-6 common questions (What formats do you accept? How long does it take? Is my footage safe? etc.)

**Footer:**
- Navigation links
- Contact email and phone
- Physical address (builds trust)
- Social media links
- Privacy Policy, Terms of Service links

---

#### 1.2.2 Pricing & Products Page (`/pricing`)

**Supported Formats Section:**
Display cards for each format type with icons and descriptions:
- **VHS** — Standard VHS tapes (T-120, T-160, etc.)
- **VHS-C** — Compact VHS camcorder tapes
- **Hi8 / Video8** — Sony camcorder formats
- **MiniDV** — Digital camcorder tapes
- **Betamax** — Legacy Sony format (premium pricing)

**Pricing Table:**
Create a clear, scannable pricing structure:

| Service | Price |
|---------|-------|
| Base digitization (per tape) | $25 |
| Per hour of footage | $10 |
| Output: MP4 download | Included |
| Output: USB drive | +$15 |
| Output: DVD (per disc) | +$8 |
| Output: Cloud storage (1 year) | +$10 |
| Return original tapes | +$5 shipping |
| Discard tapes (eco-friendly) | Free |
| Rush processing (5 days) | +50% |

**Add-ons Section:**
- Chapter markers / scene detection
- Basic color correction and enhancement
- Custom thumbnail generation
- Duplicate copies

**Bulk Discount Callout:**
- "Converting 10+ tapes? Contact us for volume pricing"

---

#### 1.2.3 About Page (`/about`)

**Our Story Section:**
- Founder story emphasizing care for preserving memories
- Photo of team/facility (stock or real)
- Mission statement

**Our Process Section:**
- Detailed walkthrough with photos/illustrations:
  1. Tape inspection and cleaning
  2. Professional-grade playback equipment
  3. High-resolution digital capture
  4. Quality review and enhancement
  5. Secure file delivery

**Equipment & Quality Section:**
- Mention professional equipment (builds credibility)
- Sample quality comparisons (before/after if applicable)

**Security & Privacy Section:**
- Explain how tapes are handled, stored, and tracked
- Data privacy commitment
- Secure facility details

---

#### 1.2.4 Get Started / Order Configurator (`/get-started`)

**This is the core conversion flow — make it exceptional.**

**Design Approach:**
- Multi-step wizard with progress indicator at top
- One question/section per step to avoid overwhelm
- Large, tappable selection cards (not tiny radio buttons)
- Smooth animations between steps (Framer Motion)
- Persistent price summary sidebar (desktop) or sticky bottom bar (mobile)
- "Back" and "Continue" navigation with keyboard support

---

**Step 1: Tape Format Selection**

Display format options as large visual cards with:
- Icon/illustration of each tape type
- Format name
- Brief description and era ("Popular 1980s-1990s")
- "Not sure?" link opens a visual identification guide modal

Options:
- VHS
- VHS-C
- Hi8 / Video8
- MiniDV
- Betamax
- Mixed / Multiple Types (allows selecting multiple)

**Identification Helper Modal:**
Show side-by-side images of each format with physical dimensions and distinguishing features to help customers identify their tapes.

---

**Step 2: Quantity**

**Question:** "How many tapes do you have?"

Input options:
- Visual counter with +/- buttons (min: 1, max: 100)
- For "Mixed" selection from step 1, show a counter for each format type
- Quick-select buttons: "1-5", "6-10", "11-20", "20+"

Display running subtotal as quantity changes.

---

**Step 3: Estimated Footage Duration**

**Question:** "Approximately how many hours of footage total?"

**Helper Box (prominently displayed):**
> **How to estimate recording time:**
> - Check the tape label (T-120 = up to 2 hrs in SP mode, 4 hrs in LP, 6 hrs in EP)
> - Most home recordings used EP/LP mode for longer recording
> - A typical full tape averages 2-4 hours
> - When in doubt, estimate high — we only charge for actual footage

**Input:**
- Slider or segmented control: "Less than 5 hours", "5-10 hours", "10-20 hours", "20-50 hours", "50+ hours"
- Or numeric input with +/- controls

**Pricing Note:**
Display per-hour rate and how it affects total

---

**Step 4: Output Format Selection**

**Question:** "How would you like to receive your digital files?"

Options as selectable cards (allow multiple selections):

1. **Digital Download (MP4)**
   - Included with every order
   - Secure download link valid for 30 days
   - High-quality H.264 encoding
   - ✓ Selected by default, cannot deselect

2. **USB Flash Drive**
   - +$15
   - Pre-loaded and mailed to you
   - Capacity matched to your footage

3. **DVD Copies**
   - +$8 per disc
   - Chaptered for easy navigation
   - Show disc quantity estimator based on footage hours

4. **Cloud Storage**
   - +$10
   - 1 year of secure cloud access
   - Stream from any device
   - Shareable family links

---

**Step 5: Original Tape Handling**

**Question:** "What should we do with your original tapes?"

Options as two large cards with icons:

1. **Return My Tapes**
   - +$5 (covers return shipping)
   - "We'll safely package and mail back your originals"
   - Icon: shipping box with tapes

2. **Eco-Friendly Disposal**
   - Free
   - "We'll responsibly recycle the materials"
   - Icon: recycling symbol
   - Small note: "Many customers choose this once their memories are safely digital"

---

**Step 6: Processing Speed**

**Question:** "When do you need your files?"

Options:

1. **Standard Processing**
   - Included
   - 2-3 weeks turnaround
   - "Most popular"

2. **Rush Processing**
   - +50% of order total
   - 5 business days turnaround
   - "For time-sensitive projects"

---

**Step 7: Order Review & Summary**

**Full order summary showing:**
- Each line item with quantity and price
- Subtotal
- Any applicable discounts
- Estimated total (note: "Final price confirmed after tape inspection")

**Editable sections:**
- Each section has an "Edit" link to jump back to that step

**Additional options:**
- "Add special instructions" text field (e.g., "Handle with care — wedding footage")
- Gift order checkbox (ships to different address, no pricing shown)

**CTA Button:** "Continue to Checkout"

---

**Step 8: Authentication Gate**

If not logged in, show:
- "Sign in to continue" with Google and Facebook OAuth buttons
- "Or continue with email" — email magic link option
- Brief explanation: "We'll use this to send order updates and your download links"

Use NextAuth.js with:
- Google OAuth provider
- Facebook OAuth provider
- Email magic link (passwordless) as fallback

After authentication, redirect back to checkout.

---

**Step 9: Checkout**

**Shipping Address Form:**
- Name
- Street address (with autocomplete via Google Places API)
- City, State, ZIP
- Phone number (for delivery updates)
- "Save as default address" checkbox

**Payment Section:**
- Integrate Stripe Elements for card input
- Or use Stripe Checkout redirect for simpler implementation
- Show accepted payment methods (Visa, MC, Amex, Apple Pay, Google Pay)

**Order Summary Sidebar:**
- Itemized breakdown
- Total

**Terms Checkbox:**
- "I agree to the Terms of Service and Privacy Policy"

**Submit Button:**
- "Place Order — $XXX"
- Loading state with spinner
- Disable double-clicks

---

**Step 10: Order Confirmation**

**Success Page (`/order/[orderId]/confirmation`):**

Show:
- Checkmark animation
- "Order Confirmed!" heading
- Order number prominently displayed
- Summary of what happens next

**Next Steps Section:**
1. "Check your email for your prepaid shipping label"
2. "Pack your tapes securely and drop off at any [carrier] location"
3. "We'll notify you when we receive your tapes"
4. "Your digital files will be ready in [X] days"

**Shipping Label CTA:**
- "Download Shipping Label" button
- "View Packing Instructions" link

---

### 1.3 Additional Customer Features

**User Dashboard (`/dashboard`):**
- Order history with status tracking
- Download links for completed orders
- Account settings (email, password, default address)
- Re-order functionality

**Order Status Page (`/order/[orderId]`):**
- Visual progress tracker showing current status:
  - Order Placed ✓
  - Label Sent ✓
  - Tapes Received ✓
  - Digitization In Progress
  - Quality Check
  - Ready for Download
  - Shipped (if physical media ordered)
  - Complete

**Help/Support:**
- Contact form
- FAQ page
- Live chat widget (optional — integrate Intercom or Crisp)

---

## Part 2: Backend & Admin Platform

### 2.1 Admin Dashboard (`/admin`)

**Authentication:**
- Separate admin login (not OAuth — use email/password with 2FA)
- Role-based access: Admin, Operator, Viewer
- Protect all `/admin` routes with middleware

---

### 2.2 Dashboard Overview (`/admin/dashboard`)

**Key Metrics Cards:**
- Orders today / this week / this month
- Revenue today / this week / this month
- Tapes in queue
- Average processing time

**Recent Orders Table:**
- Last 10 orders with quick status indicators
- Click to view order details

**Alerts Section:**
- Orders waiting for tapes > 7 days
- Orders approaching deadline
- Low inventory warnings (USBs, DVDs, mailers)

---

### 2.3 Order Management (`/admin/orders`)

**Orders List View:**

**Filters:**
- Status dropdown (All, Pending, Tapes Received, In Progress, Quality Check, Ready, Shipped, Complete, Cancelled)
- Date range picker
- Search by order ID, customer name, email
- Sort by date, status, priority

**Table Columns:**
- Order ID
- Customer name
- Tape count
- Status (color-coded badge)
- Order date
- Due date
- Priority flag (rush orders)
- Actions (View, Update Status)

**Bulk Actions:**
- Select multiple orders
- Bulk status update
- Bulk print labels
- Export to CSV

---

### 2.4 Order Detail View (`/admin/orders/[orderId]`)

**Customer Information Card:**
- Name, email, phone
- Shipping address
- Account creation date
- Order history link

**Order Details Card:**
- Order ID and date
- Line items with quantities and prices
- Special instructions
- Order total
- Payment status

**Status Timeline:**
- Visual timeline of all status changes
- Timestamp and user who made each change
- Add note to timeline feature

**Status Update Section:**
- Dropdown to select new status
- Auto-triggers corresponding email to customer
- Require confirmation for status changes

**Actions:**
- Print packing slip
- Resend confirmation email
- Resend shipping label
- Issue refund (partial or full via Stripe)
- Add internal note
- Cancel order

**Tape Details Section (editable):**
- Actual tape count received
- Actual footage hours
- Price adjustment if different from estimate
- Quality notes

---

### 2.5 Automation System

**Email Automations:**

Implement automated emails triggered by status changes:

| Trigger | Email | Content |
|---------|-------|---------|
| Order placed | Order Confirmation | Receipt, next steps, shipping label attached |
| Label generated | Shipping Label | Prepaid label PDF, packing instructions |
| Tapes received | Tapes Received | Confirmation we have them, estimated completion |
| Processing started | Digitization Started | Progress update |
| Quality check | Almost Ready | Preview available (optional) |
| Ready for download | Files Ready | Download links, review request |
| Physical media shipped | Package Shipped | Tracking number |
| 7 days after completion | Follow-up | Satisfaction check, referral program |

**Email Template System:**
- Use React Email or MJML for templates
- Consistent branding
- Mobile-responsive design
- Unsubscribe link for marketing emails

**Webhook Handlers:**
- Stripe payment webhooks (payment_intent.succeeded, refund.created)
- Shipping carrier webhooks (tracking updates)

**Automation Rules Engine (stretch goal):**
- Admin UI to create custom rules
- "When [trigger] then [action]" builder
- Example: "When order > $200, add to VIP list"

---

### 2.6 Shipping Label Generation

**Integration: EasyPost API** (or ShipStation)

**Prepaid Return Label Flow:**
1. Customer places order
2. System generates return label via EasyPost API
3. Label PDF attached to confirmation email
4. Label also available in customer dashboard
5. Track when label is scanned (customer shipped)

**Outbound Label Flow (for returning tapes/USBs):**
1. Admin marks order as ready to ship
2. System generates outbound label
3. Label printed in admin panel
4. Tracking number recorded and sent to customer

**Carrier Options:**
- USPS Priority Mail (default for most)
- UPS Ground (for bulk orders)
- FedEx (for rush orders)

**Label Admin View:**
- List of all generated labels
- Status (unused, in transit, delivered)
- Tracking links
- Cost tracking

---

### 2.7 Inventory Tracking (optional enhancement)

Track supplies inventory:
- USB drives (by capacity)
- Blank DVDs
- Mailer boxes
- Return labels (pre-purchased batches)

Low stock alerts when thresholds are hit.

---

### 2.8 Reporting (`/admin/reports`)

**Standard Reports:**
- Revenue by period (daily, weekly, monthly)
- Orders by status
- Average order value
- Processing time metrics
- Customer acquisition (new vs returning)
- Format popularity breakdown

**Export Options:**
- CSV export for all reports
- Date range selection

---

## Part 3: Technical Implementation Details

### 3.1 Database Schema (Prisma)

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  phone         String?
  role          Role      @default(CUSTOMER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  orders        Order[]
  addresses     Address[]
}

enum Role {
  CUSTOMER
  OPERATOR
  ADMIN
}

model Address {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  name          String
  street        String
  street2       String?
  city          String
  state         String
  zip           String
  country       String   @default("US")
  phone         String?
  isDefault     Boolean  @default(false)
  createdAt     DateTime @default(now())
}

model Order {
  id              String      @id @default(cuid())
  orderNumber     String      @unique  // Human-readable: RR-2024-00001
  userId          String
  user            User        @relation(fields: [userId], references: [id])
  status          OrderStatus @default(PENDING)
  
  // Shipping
  shippingAddressId String
  returnLabel       String?   // URL to label PDF
  returnTracking    String?
  outboundLabel     String?
  outboundTracking  String?
  
  // Pricing
  subtotal        Decimal
  rushFee         Decimal     @default(0)
  discount        Decimal     @default(0)
  total           Decimal
  
  // Stripe
  stripePaymentId String?
  paymentStatus   PaymentStatus @default(PENDING)
  
  // Metadata
  specialInstructions String?
  isRush          Boolean     @default(false)
  isGift          Boolean     @default(false)
  estimatedCompletion DateTime?
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  items           OrderItem[]
  statusHistory   StatusHistory[]
  notes           OrderNote[]
}

enum OrderStatus {
  PENDING           // Order placed, awaiting tapes
  TAPES_RECEIVED    // Tapes arrived at facility
  IN_PROGRESS       // Digitization underway
  QUALITY_CHECK     // Review before delivery
  READY             // Files ready for download
  SHIPPED           // Physical media mailed
  COMPLETE          // Customer confirmed receipt
  CANCELLED
}

enum PaymentStatus {
  PENDING
  PAID
  REFUNDED
  PARTIAL_REFUND
}

model OrderItem {
  id            String      @id @default(cuid())
  orderId       String
  order         Order       @relation(fields: [orderId], references: [id])
  
  type          ItemType
  format        TapeFormat?
  quantity      Int         @default(1)
  estimatedHours Decimal?
  actualHours   Decimal?
  unitPrice     Decimal
  totalPrice    Decimal
  
  // For digital delivery
  downloadUrl   String?
  downloadExpiry DateTime?
}

enum ItemType {
  TAPE_DIGITIZATION
  OUTPUT_USB
  OUTPUT_DVD
  OUTPUT_CLOUD
  RETURN_SHIPPING
  RUSH_FEE
}

enum TapeFormat {
  VHS
  VHS_C
  HI8
  MINIDV
  BETAMAX
}

model StatusHistory {
  id          String      @id @default(cuid())
  orderId     String
  order       Order       @relation(fields: [orderId], references: [id])
  status      OrderStatus
  note        String?
  changedBy   String?     // User ID of admin who made change
  createdAt   DateTime    @default(now())
}

model OrderNote {
  id          String   @id @default(cuid())
  orderId     String
  order       Order    @relation(fields: [orderId], references: [id])
  content     String
  isInternal  Boolean  @default(true)  // Internal notes not shown to customer
  createdBy   String
  createdAt   DateTime @default(now())
}
```

---

### 3.2 API Routes Structure

```
/api
  /auth
    /[...nextauth]        # NextAuth handlers
  /orders
    GET /                 # List orders (paginated, filtered)
    POST /                # Create new order
    GET /[id]             # Get order details
    PATCH /[id]           # Update order
    POST /[id]/status     # Update order status (triggers emails)
    POST /[id]/label      # Generate shipping label
  /users
    GET /me               # Current user profile
    PATCH /me             # Update profile
    GET /me/orders        # User's orders
  /admin
    /orders               # Admin order endpoints
    /reports              # Report generation
    /users                # User management
  /webhooks
    /stripe               # Stripe webhook handler
    /shipping             # Carrier webhook handler
```

---

### 3.3 Key Integrations

**Stripe Integration:**
```typescript
// Key endpoints needed:
- Create PaymentIntent for order
- Handle payment_intent.succeeded webhook
- Process refunds
- Store Stripe customer ID for returning customers
```

**EasyPost Integration:**
```typescript
// Key functions needed:
- createReturnLabel(toAddress, fromAddress) 
- createOutboundLabel(fromAddress, toAddress, weight)
- getTrackingStatus(trackingNumber)
- webhookHandler for tracking updates
```

**Resend/Email Integration:**
```typescript
// Email templates needed:
- orderConfirmation
- shippingLabel
- tapesReceived
- digitizationStarted
- filesReady
- packageShipped
- followUp
```

---

### 3.4 Security Considerations

- All API routes authenticated and authorized
- Rate limiting on public endpoints
- Input validation with Zod schemas
- SQL injection prevention via Prisma
- XSS prevention in React
- HTTPS only
- Secure file download links (signed URLs with expiration)
- Admin routes require admin role middleware
- Audit logging for sensitive operations
- PCI compliance via Stripe (never handle card data directly)

---

### 3.5 File Structure

```
/
├── app/
│   ├── (marketing)/          # Public pages
│   │   ├── page.tsx          # Homepage
│   │   ├── pricing/
│   │   ├── about/
│   │   └── layout.tsx
│   ├── (app)/                # Authenticated customer area
│   │   ├── dashboard/
│   │   ├── orders/
│   │   └── layout.tsx
│   ├── get-started/          # Order configurator
│   │   └── page.tsx
│   ├── checkout/
│   │   └── page.tsx
│   ├── admin/                # Admin dashboard
│   │   ├── dashboard/
│   │   ├── orders/
│   │   ├── reports/
│   │   └── layout.tsx
│   └── api/
│       ├── auth/
│       ├── orders/
│       ├── webhooks/
│       └── admin/
├── components/
│   ├── ui/                   # Shared UI components
│   ├── forms/                # Form components
│   ├── configurator/         # Order wizard steps
│   └── admin/                # Admin-specific components
├── lib/
│   ├── prisma.ts
│   ├── stripe.ts
│   ├── easypost.ts
│   ├── email.ts
│   └── utils.ts
├── prisma/
│   └── schema.prisma
└── emails/                   # React Email templates
    ├── order-confirmation.tsx
    ├── files-ready.tsx
    └── ...
```

---

## Part 4: Deployment & Launch Checklist

### Pre-Launch:
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Stripe webhooks configured
- [ ] Email sending verified
- [ ] Shipping API tested
- [ ] OAuth providers configured
- [ ] Admin accounts created
- [ ] Test order flow end-to-end
- [ ] Mobile responsive testing
- [ ] Performance optimization (Lighthouse score > 90)

### Post-Launch:
- [ ] Error monitoring (Sentry)
- [ ] Analytics (Plausible or GA4)
- [ ] Uptime monitoring
- [ ] Database backups configured
- [ ] Documentation for team

---

## Summary

This platform should be built with simplicity as a core principle — avoid over-engineering. Start with the MVP features and add enhancements iteratively. The customer experience should feel smooth and trustworthy, while the admin experience should be efficient and informative.

**Priority Order for Development:**
1. Database schema and basic API
2. Customer configurator and checkout
3. Stripe payment integration
4. Admin order management
5. Email automations
6. Shipping label generation
7. Customer dashboard
8. Reporting and analytics

Focus on getting the core order flow working perfectly before adding nice-to-haves.
