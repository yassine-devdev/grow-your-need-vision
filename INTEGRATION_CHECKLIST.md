# 🔧 Integration Checklist - Connect All Features

## Step 1: Initialize Database (Required First!)

```bash
# Run these in order:
node seed-all-data.cjs          # Creates school data
node init-saas-collections.cjs  # Creates SaaS collections
```

**Verify**: Check PocketBase admin at `http://127.0.0.1:8090/_/` - should see 50+ collections

---

## Step 2: Add Routes to App.tsx

**File**: `src/App.tsx`

Add these imports:
```typescript
// SaaS Owner Features
import { TenantDashboard } from './apps/owner/TenantDashboard';
import { AnalyticsDashboard } from './apps/owner/AnalyticsDashboard';
import { SupportDashboard } from './apps/owner/SupportDashboard';
import { TenantOnboardingFlow } from './apps/owner/TenantOnboardingFlow';
import { OverlayAppsManager } from './apps/owner/OverlayAppsManager';

// Edumultiverse
import { Leaderboard } from './apps/edumultiverse/components/Leaderboard';
```

Add these routes:
```typescript
{/* SaaS Owner Routes */}
<Route path="/owner/tenants" element={<TenantDashboard />} />
<Route path="/owner/analytics" element={<AnalyticsDashboard />} />
<Route path="/owner/support" element={<SupportDashboard />} />
<Route path="/owner/overlay-apps" element={<OverlayAppsManager />} />

{/* Public Onboarding */}
<Route path="/signup" element={<TenantOnboardingFlow />} />

{/* Edumultiverse */}
<Route path="/multiverse/leaderboard" element={<Leaderboard />} />
```

---

## Step 3: Update Owner Navigation

**File**: `src/components/layout/OwnerLayout.tsx` (or wherever owner menu is)

Add to navigation items:
```typescript
const ownerMenuItems = [
  { icon: 'HomeIcon', label: 'Dashboard', path: '/owner/dashboard' },
  { icon: 'BuildingOfficeIcon', label: 'Tenants', path: '/owner/tenants' },  // NEW
  { icon: 'ChartBarIcon', label: 'Analytics', path: '/owner/analytics' },     // NEW
  { icon: 'TicketIcon', label: 'Support', path: '/owner/support' },           // NEW
  { icon: 'CogIcon', label: 'Content', path: '/owner/overlay-apps' },        // NEW
  // ... existing items
];
```

---

## Step 4: Test Each Feature

### A. Tenant Management
1. Go to `/owner/tenants`
2. Should see: KPI cards (Total, Active, Trial, MRR)
3. Click "Add Tenant" - modal should open
4. Create test tenant

### B. Analytics
1. Go to `/owner/analytics`
2. Should see: MRR, ARR, LTV, Churn metrics
3. Revenue chart should display

### C. Support
1. Go to `/owner/support`
2. Click "Create Ticket"
3. Fill form, submit
4. Ticket appears in list

### D. Onboarding
1. Go to `/signup`
2. Complete 4-step wizard
3. New tenant created automatically

### E. Content Management
1. Go to `/owner/overlay-apps`
2. Click "Media" app
3. Add a movie/channel
4. Test M3U8 import

### F. Edumultiverse
1. Go to `/multiverse/leaderboard`
2. Should see top 3 podium
3. Check rankings

---

## Step 5: Environment Variables

**File**: `.env.local`

Add if not present:
```env
# SaaS
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
REACT_APP_ENABLE_SAAS=true

# Analytics
REACT_APP_ANALYTICS_ENABLED=true
```

---

## Step 6: Verify Data Created

In PocketBase admin, check these collections have data:

**School Data** (from seed-all-data.cjs):
- ✅ users (7 users)
- ✅ classes (3 classes)
- ✅ subjects (5 subjects)
- ✅ gamification_achievements (5 achievements)

**SaaS Data** (from init-saas-collections.cjs):
- ✅ tenants (empty initially)
- ✅ subscription_plans (4 plans)
- ✅ support_tickets (empty)

---

## Step 7: Quick Smoke Test

```bash
# 1. Start app
npm run dev

# 2. Login as owner
# Email: owner@growyourneed.com
# Password: Darnag123456789@

# 3. Visit each page:
http://localhost:3000/owner/tenants
http://localhost:3000/owner/analytics
http://localhost:3000/owner/support
http://localhost:3000/owner/overlay-apps
http://localhost:3000/signup
http://localhost:3000/multiverse/leaderboard

# 4. Verify no console errors
```

---

## Common Issues & Fixes

### "Collection doesn't exist"
**Fix**: Run `node init-saas-collections.cjs`

### "Routes not found"
**Fix**: Check App.tsx has all routes added

### "MRR shows $0"
**Fix**: Create a test tenant with active subscription

### "Leaderboard empty"
**Fix**: Seed gamification_progress collection with sample data

---

## Production Deployment

When ready to deploy:

```bash
# 1. Build
node build-production.cjs

# 2. Set production env vars
# 3. Deploy build/ folder
# 4. Run database scripts on production PocketBase
# 5. Test all features
# 6. Go live!
```

---

## ✅ Integration Complete When:

- [ ] Database collections created (50+)
- [ ] Routes added to App.tsx
- [ ] Owner navigation updated
- [ ] All dashboards accessible
- [ ] No console errors
- [ ] Can create tenant
- [ ] Can create support ticket
- [ ] Analytics show data
- [ ] Leaderboard displays
- [ ] Content managers work

**Then you're ready to onboard schools!** 🚀
