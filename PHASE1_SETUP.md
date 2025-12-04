# Phase 1 Database Setup

## Overview
This directory contains scripts to initialize and seed the database collections needed for Phase 1 of production readiness.

## Collections Created
1. **school_settings** - School configuration (replaces hardcoded "Green Valley High", etc.)
2. **individual_courses** - Course enrollments for Individual users
3. **wellness_data** - Wellness tracking (mood, energy, sleep, etc.)
4. **marketplace_orders** - Marketplace purchase orders
5. **service_bookings** - Service appointments and bookings
6. **recommendations** - Personalized content recommendations
7. **individual_goals** - User goals (daily, weekly, monthly)

## Setup Instructions

### Prerequisites
- PocketBase running on `http://127.0.0.1:8090`
- Node.js installed  
- Admin credentials set in environment or use defaults

### Step 1: Install Dependencies (if needed)
```bash
npm install pocketbase
```

### Step 2: Run Collection Initialization
This creates all 7 new collections:

```bash
node init-phase1-collections.cjs
```

**What it does**:
- Authenticates with PocketBase as admin
- Creates each collection with proper schema
- Sets up access rules (permissions)
- Skips collections that already exist

### Step 3: Seed Test Data
This populates collections with sample data:

```bash
node seed-phase1-data.cjs
```

**What it does**:
- Creates/finds an Individual user for testing
- Creates school settings (1 record)
- Creates 3 sample courses
- Creates 7 days of wellness data
- Creates 3 marketplace orders
- Creates 2 service bookings
- Creates 3 recommendations
- Creates 4 goals (daily and monthly)

### Step 4: Verify in PocketBase Admin
1. Open http://127.0.0.1:8090/_/
2. Check Collections tab
3. Verify all 7 new collections exist
4. Browse records to see sample data

## Troubleshooting

### "PocketBase is not a constructor"
The scripts use CommonJS (.cjs) to work with the project's ES module setup.  
If you still get errors, check your `pocketbase` package version:
```bash
npm list pocketbase
```

### "Authentication failed"
Update the admin credentials in the scripts or set environment variables:
```bash
$env:POCKETBASE_ADMIN_EMAIL="your-admin@email.com"
$env:POCKETBASE_ADMIN_PASSWORD="your-password"
```

### "Collection already exists"
This is normal! The scripts skip existing collections. If you want to recreate them:
1. Delete the collections in PocketBase Admin
2. Run the init script again

## Next Steps

After running these scripts:

1. **Test Individual Dashboard**:
   - Log in as Individual user: `individual.user@test.com` / `TestPassword123!`
   - Check that dashboard shows real data (not "2 Courses", "85 Score" hardcoded values)

2. **Test School Settings**:
   -Log in as School Admin
   - Verify school name shows "Riverside Academy" instead of "Green Valley High"

3. **Continue Phase 1**:
   - Update remaining dashboard JSX to use real data
   - Implement payment processing
   - Add file upload functionality

## Files

- `init-phase1-collections.cjs` - Creates collections
- `seed-phase1-data.cjs` - Populates sample data
- `PHASE1_SETUP.md` - This file

## Database Schema Reference

### school_settings
- school_name, academic_year, school_logo, address, phone, email
- timezone, locale, currency
- grading_scale, term_system
- Feature toggles (enable_gradebook, enable_attendance, etc.)
- Attendance settings, grade thresholds

### individual_courses
- user (relation), course_title, course_description, course_image
- progress (0-100), enrolled_date, completed_date
- status (active/completed/paused)

### wellness_data
- user (relation), date
- mood_score, energy_level, stress_level (1-10)
- sleep_hours, water_intake, steps
- exercise_minutes, meditation_minutes

### marketplace_orders
- user (relation), order_number, product_name, product_image
- quantity, price, status, order_date, tracking_number

### service_bookings
- user (relation), service_name, service_provider
- booking_date, booking_time, duration_minutes
- status, price, location

### recommendations
- user (optional - null for general recs), item_type, item_id
- title, description, image_url, price, category, score

### individual_goals
- user (relation), goal_text, goal_type
- is_completed, due_date, completed_date

---

**Created**: 2025-12-04  
**Phase**: 1 - Production Minimum  
**Status**: Ready for Use
