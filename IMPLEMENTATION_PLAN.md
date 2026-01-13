# NC Issues Platform - Complete Implementation Plan

## Project Status: Phase 2 of 8

**Last Updated**: January 12, 2026

---

## ✅ Completed Features

### 1. Multi-Tier User System
- ✅ Database schema with 4 user tiers (Public, Member, Contributor, Admin)
- ✅ Public user registration (name + phone)
- ✅ Subscription tracking fields
- ✅ Access control utilities (`lib/access-control.ts`)
- ✅ Upgrade prompt components
- ✅ Pricing page with tier comparison
- ✅ Homepage with login/signup buttons

### 2. Issues Platform (Blog → Issues)
- ✅ Issues database table with tags
- ✅ Issue submission for contributors
- ✅ Issues listing with filtering
- ✅ Issue detail pages with comments
- ✅ Social sharing for issues and comments
- ✅ Open Graph meta tags for rich previews
- ✅ Comment-specific OG tags

### 3. Bill Tracking System
- ✅ Bill detail pages with full information
- ✅ Bill history timeline
- ✅ Vote records and results
- ✅ Bill text and versions
- ✅ Sponsor and co-sponsor display
- ✅ Track/untrack functionality (UI ready)

### 4. Member Features
- ✅ Member dashboard
- ✅ Member settings page
- ✅ Account security (claimed accounts)
- ✅ Member authentication system
- ✅ Profile editing

### 5. Organization System (Database Only)
- ✅ Organizations table created
- ✅ Organization members (many-to-many)
- ✅ Organization positions on bills/issues
- ✅ Organization followers
- ✅ Subscription tiers for organizations

---

## 🚧 In Progress / Next Steps

### Phase 2: Organization Registration & Profiles (CURRENT)

**Files to Create:**
1. `/app/organizations/register/page.tsx` - Organization registration form
2. `/app/organizations/[slug]/page.tsx` - Organization profile page
3. `/app/api/organizations/route.ts` - Organization CRUD API
4. `/app/api/organizations/[id]/positions/route.ts` - Position management API
5. `/app/api/organizations/[id]/follow/route.ts` - Follow/unfollow API

**Features:**
- Organization registration form with:
  - Basic info (name, type, email, phone)
  - Description and mission
  - Logo and banner upload
  - Address information
  - EIN for nonprofits
- Organization profile pages showing:
  - Organization details
  - Positions on bills and issues
  - Member list
  - Follower count
  - Follow button
- Organization directory/listing page

**Estimated Time**: 3-4 hours

---

### Phase 3: Stripe Payment Integration

**Prerequisites:**
- Stripe account setup
- Stripe API keys (test and production)
- Webhook endpoint configuration

**Files to Create:**
1. `/app/api/stripe/create-checkout/route.ts` - Checkout session creation
2. `/app/api/stripe/webhook/route.ts` - Webhook handler
3. `/app/api/stripe/portal/route.ts` - Customer portal redirect
4. `/app/subscribe/page.tsx` - Subscription checkout page
5. `/lib/stripe.ts` - Stripe client configuration

**Features:**
- Stripe checkout for Member ($9.99/mo) and Contributor ($19.99/mo)
- Webhook handling for:
  - `checkout.session.completed` - Activate subscription
  - `customer.subscription.updated` - Update subscription status
  - `customer.subscription.deleted` - Cancel subscription
  - `invoice.payment_succeeded` - Record payment
  - `invoice.payment_failed` - Handle failed payment
- Customer portal integration for:
  - Update payment method
  - View invoices
  - Cancel subscription

**Database Updates:**
- Add `stripe_customer_id` to members and organizations
- Add `stripe_subscription_id` to track active subscriptions
- Update subscription_history on all events

**Estimated Time**: 4-5 hours

---

### Phase 4: Feature Gating with Access Control

**Files to Update:**
1. `/app/bills/page.tsx` - Add "Track" button gating
2. `/app/bills/[id]/page.tsx` - Gate track functionality
3. `/app/issues/[slug]/page.tsx` - Gate commenting
4. `/app/issues/submit/page.tsx` - Gate issue submission
5. `/app/member-dashboard/page.tsx` - Gate dashboard access
6. `/app/api/tracked-bills/route.ts` - Add tier check
7. `/app/api/issues/[slug]/comments/route.ts` - Add tier check

**Implementation Pattern:**
```typescript
import { hasAccess, needsUpgrade } from '@/lib/access-control';
import { TrackBillsUpgrade } from '@/components/UpgradePrompt';

// In component:
if (!hasAccess(user, 'trackBills')) {
  return <TrackBillsUpgrade />;
}

// In API:
if (!hasAccess(user, 'trackBills')) {
  return NextResponse.json(
    { error: 'Upgrade to Member to track bills' },
    { status: 403 }
  );
}
```

**Features to Gate:**
- ❌ Track bills → Requires Member
- ❌ Email notifications → Requires Member
- ❌ Comment on issues → Requires Member
- ❌ Personalized dashboard → Requires Member
- ❌ Submit issues → Requires Contributor
- ❌ View issue analytics → Requires Contributor

**Estimated Time**: 2-3 hours

---

### Phase 5: Subscription Management Interface

**Files to Create:**
1. `/app/account/subscription/page.tsx` - Subscription management page
2. `/app/api/subscription/upgrade/route.ts` - Upgrade tier API
3. `/app/api/subscription/downgrade/route.ts` - Downgrade tier API
4. `/app/api/subscription/cancel/route.ts` - Cancel subscription API

**Features:**
- Current plan display with:
  - Tier name and price
  - Billing cycle
  - Next billing date
  - Payment method
- Upgrade options:
  - Public → Member
  - Member → Contributor
  - Immediate upgrade with prorated billing
- Downgrade options:
  - Contributor → Member
  - Member → Public (cancel)
  - Takes effect at end of billing period
- Cancel subscription:
  - Confirmation dialog
  - Access continues until period end
  - Option to reactivate before expiration
- Payment method management:
  - Link to Stripe customer portal
  - Update card
  - View invoices

**Estimated Time**: 3-4 hours

---

### Phase 6: Admin Dashboard

**Files to Create:**
1. `/app/admin/page.tsx` - Admin dashboard home
2. `/app/admin/users/page.tsx` - User management
3. `/app/admin/organizations/page.tsx` - Organization management
4. `/app/admin/subscriptions/page.tsx` - Subscription overview
5. `/app/admin/content/page.tsx` - Content moderation
6. `/app/admin/analytics/page.tsx` - Platform analytics
7. `/app/api/admin/users/route.ts` - User management API
8. `/app/api/admin/organizations/route.ts` - Organization management API

**Features:**

**User Management:**
- List all users with filters (tier, status, date)
- Search by name, email, phone
- View user details
- Change user tier
- Activate/deactivate subscriptions
- View user activity
- Ban/unban users

**Organization Management:**
- List all organizations
- Verify organizations (badge)
- View organization details
- Manage organization subscriptions
- View organization positions
- Moderate organization content

**Subscription Management:**
- Overview dashboard:
  - Total MRR (Monthly Recurring Revenue)
  - Active subscriptions by tier
  - Churn rate
  - New subscriptions this month
- Failed payments list
- Expiring subscriptions
- Cancellation reasons

**Content Moderation:**
- Flagged comments
- Reported issues
- Pending organization verifications
- Approve/reject content

**Analytics:**
- User growth charts
- Revenue charts
- Engagement metrics
- Popular bills and issues
- Traffic sources

**Estimated Time**: 6-8 hours

---

### Phase 7: Tier Badges & Organization Indicators

**Files to Update:**
1. `/components/UserBadge.tsx` - Create reusable badge component
2. `/components/OrganizationBadge.tsx` - Organization badge component
3. `/app/member-dashboard/page.tsx` - Add tier badge
4. `/app/issues/[slug]/page.tsx` - Show badges on comments
5. `/app/bills/[id]/page.tsx` - Show organization positions
6. Navigation components - Show tier in header

**Badge Types:**
- **User Tier Badges:**
  - Public (gray)
  - Member (blue)
  - Contributor (purple)
  - Admin (red)
- **Organization Badges:**
  - Verified (blue checkmark)
  - Organization type icon
  - Subscription tier
- **Special Badges:**
  - Voter Verified (green checkmark)
  - Early Supporter
  - Top Contributor

**Display Locations:**
- User profile
- Comments
- Dashboard header
- Member settings
- Issue submissions
- Organization profiles

**Estimated Time**: 2-3 hours

---

### Phase 8: Testing & Deployment

**Testing Checklist:**

**User Flows:**
- [ ] Public user registration
- [ ] Member registration via voter lookup
- [ ] Member subscription purchase
- [ ] Contributor upgrade
- [ ] Organization registration
- [ ] Organization verification
- [ ] Bill tracking (gated)
- [ ] Issue commenting (gated)
- [ ] Issue submission (gated)
- [ ] Subscription management
- [ ] Payment method update
- [ ] Subscription cancellation

**Payment Testing:**
- [ ] Successful payment (test card: 4242 4242 4242 4242)
- [ ] Failed payment (test card: 4000 0000 0000 0002)
- [ ] Webhook delivery
- [ ] Subscription activation
- [ ] Subscription renewal
- [ ] Subscription cancellation
- [ ] Refund processing

**Access Control:**
- [ ] Public users see upgrade prompts
- [ ] Members can track bills
- [ ] Members can comment
- [ ] Contributors can submit issues
- [ ] Admins can access admin dashboard
- [ ] Expired subscriptions downgrade to public

**Organization Features:**
- [ ] Organization registration
- [ ] Organization profile display
- [ ] Take position on bill
- [ ] Take position on issue
- [ ] Follow organization
- [ ] View organization positions

**Admin Features:**
- [ ] View all users
- [ ] Change user tier
- [ ] Verify organization
- [ ] View subscription metrics
- [ ] Moderate content

**Estimated Time**: 4-5 hours

---

## 📊 Development Timeline

| Phase | Feature | Time Estimate | Status |
|-------|---------|---------------|--------|
| 1 | Multi-tier user system | 4 hours | ✅ Complete |
| 2 | Organization accounts | 4 hours | 🚧 In Progress |
| 3 | Stripe integration | 5 hours | ⏳ Pending |
| 4 | Feature gating | 3 hours | ⏳ Pending |
| 5 | Subscription management | 4 hours | ⏳ Pending |
| 6 | Admin dashboard | 8 hours | ⏳ Pending |
| 7 | Badges & UI polish | 3 hours | ⏳ Pending |
| 8 | Testing & deployment | 5 hours | ⏳ Pending |
| **Total** | | **36 hours** | **11% Complete** |

---

## 🎯 Priority Order

### High Priority (Core Revenue Features)
1. ✅ Multi-tier system
2. 🚧 Organization accounts
3. ⏳ Stripe payment integration
4. ⏳ Feature gating (access control)
5. ⏳ Subscription management

### Medium Priority (User Experience)
6. ⏳ Admin dashboard
7. ⏳ Tier badges
8. ⏳ Organization profiles

### Low Priority (Polish)
9. ⏳ Analytics dashboard
10. ⏳ Advanced moderation tools

---

## 💰 Revenue Model

### Individual Subscriptions
- **Public**: Free (70% of users)
- **Member**: $9.99/month (25% of users)
- **Contributor**: $19.99/month (5% of users)

### Organization Subscriptions
- **Free**: Basic profile, limited positions
- **Basic**: $29.99/month - Unlimited positions, analytics
- **Pro**: $99.99/month - Featured placement, priority support
- **Enterprise**: Custom pricing - White-label, API access

### Projected Revenue (1,000 users + 50 organizations)
- 700 Public: $0
- 250 Members: $2,497.50/month
- 50 Contributors: $999.50/month
- 30 Free Orgs: $0
- 15 Basic Orgs: $449.85/month
- 5 Pro Orgs: $499.95/month
- **Total MRR**: $4,446.80/month
- **Annual**: $53,361.60/year

---

## 🔧 Technical Requirements

### Environment Variables Needed
```env
# Stripe (to be added)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Existing (already configured)
DATABASE_URL=postgresql://...
JWT_SECRET=...
NEXT_PUBLIC_BASE_URL=https://...
```

### Stripe Products to Create
1. Member Monthly - $9.99/month
2. Contributor Monthly - $19.99/month
3. Organization Basic - $29.99/month
4. Organization Pro - $99.99/month

### Stripe Webhooks to Configure
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

---

## 📝 Database Schema Summary

### Completed Tables
- ✅ `members` - Individual users with tiers
- ✅ `public_users` - Free users (name + phone)
- ✅ `subscription_history` - Payment tracking
- ✅ `issues` - Community issues
- ✅ `issue_comments` - Comments on issues
- ✅ `issue_tags` - Issue categorization
- ✅ `tracked_bills` - User bill tracking
- ✅ `organizations` - Organization accounts
- ✅ `organization_members` - Org membership
- ✅ `organization_positions` - Stances on bills/issues
- ✅ `organization_followers` - User follows

### Tables to Add
- ⏳ `stripe_events` - Webhook event log
- ⏳ `payment_methods` - Stored payment methods
- ⏳ `invoices` - Payment records

---

## 🚀 Deployment Checklist

### Before Launch
- [ ] Set up Stripe account
- [ ] Configure Stripe products
- [ ] Set up webhook endpoint
- [ ] Add Stripe keys to environment
- [ ] Test payment flows
- [ ] Set up email notifications (SendGrid/Mailgun)
- [ ] Configure domain (custom domain)
- [ ] Set up SSL certificate
- [ ] Configure analytics (Google Analytics)
- [ ] Set up error tracking (Sentry)

### After Launch
- [ ] Monitor Stripe webhooks
- [ ] Monitor subscription activations
- [ ] Track conversion rates
- [ ] Gather user feedback
- [ ] Iterate on pricing
- [ ] Add more organization types
- [ ] Build mobile app (future)

---

## 📞 Support & Documentation

### User Documentation Needed
- How to claim voter record
- How to upgrade to Member
- How to track bills
- How to submit issues
- How to register organization
- How to take positions on bills
- How to follow organizations

### Admin Documentation Needed
- How to verify organizations
- How to manage subscriptions
- How to moderate content
- How to handle failed payments
- How to process refunds

---

## 🎉 Success Metrics

### User Engagement
- Daily active users (DAU)
- Monthly active users (MAU)
- Average session duration
- Pages per session
- Bounce rate

### Revenue Metrics
- Monthly Recurring Revenue (MRR)
- Annual Recurring Revenue (ARR)
- Customer Lifetime Value (CLV)
- Churn rate
- Conversion rate (free → paid)

### Content Metrics
- Issues submitted per month
- Comments per issue
- Bills tracked per user
- Organization positions taken
- Social shares

### Target Goals (6 months)
- 5,000 total users
- 1,500 paid subscribers (30% conversion)
- 100 organizations
- $15,000 MRR
- 500 issues submitted
- 10,000 comments

---

## 🔄 Next Actions

1. **Complete Phase 2**: Organization registration and profiles
2. **Set up Stripe**: Create account and configure products
3. **Implement Phase 3**: Payment integration
4. **Gate features**: Add access control to existing pages
5. **Build subscription management**: User-facing controls
6. **Create admin dashboard**: Platform management
7. **Add badges**: Visual tier indicators
8. **Test thoroughly**: All user flows and payments
9. **Deploy**: Launch to production
10. **Monitor**: Track metrics and iterate

---

**Document Version**: 1.0  
**Last Updated**: January 12, 2026  
**Next Review**: After Phase 2 completion
