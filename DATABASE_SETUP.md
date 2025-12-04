# 🗄️ Database Setup & Real Data Implementation Guide

This guide will help you set up all database collections and populate them with realistic data.

---

## 📋 Prerequisites

- ✅ PocketBase running (`pnpm dev:pocketbase`)
- ✅ Have admin credentials from `.env` file

---

## 🚀 Quick Setup (One Command)

```bash
# Run all setup steps in order
pnpm db:setup-files && pnpm db:seed-all && pnpm db:seed-materials
```

---

## 📝 Step-by-Step Setup

### Step 1: Create File Uploads Collection

```bash
pnpm db:setup-files
```

**What this does**:
- ✅ Creates `file_uploads` collection in PocketBase
- ✅ Adds fields: name, file, size, type, course_id, uploaded_by, tenant_id, description
- ✅ Sets up proper relations to courses, users, and tenants
- ✅ Configures access control rules
- ✅ Allows file types: PDF, DOCX, XLSX, PPTX, images, videos (max 50MB)

**Expected Output**:
```
✅ Authenticated as admin
✅ file_uploads collection created successfully

📋 Collection Rules:
  List: Any authenticated user can list files
  View: Any authenticated user can view files
  Create: Admin, Teacher, or Owner can upload files
  Update: File uploader, Admin, or Owner can update
  Delete: File uploader, Admin, or Owner can delete

✅ Migration completed successfully
```

---

### Step 2: Seed Course Materials

```bash
pnpm db:seed-materials
```

**What this does**:
- ✅ Creates realistic course materials for existing courses
- ✅ Links materials to courses automatically
- ✅ Handles Computer Science, Math, English, Physics courses
- ✅ Creates files with realistic names, sizes, and descriptions

**Sample Materials Created**:
- `Introduction_to_Programming_Syllabus.pdf` (240 KB)
- `Week_1_Lecture_Notes_Variables.pdf` (500 KB)
- `Calculus_Course_Syllabus.pdf` (320 KB)
- `Literary_Analysis_Guide.pdf` (400 KB)
- `Physics_Lab_Manual.pdf` (4 MB)
- ... and more!

**Expected Output**:
```
✅ Authenticated as admin
📤 Using teacher John Doe as uploader

📦 Creating course materials...

✅ Created: Introduction_to_Programming_Syllabus.pdf for Introduction to Programming
✅ Created: Week_1_Lecture_Notes_Variables.pdf for Introduction to Programming
✅ Created: Calculus_Course_Syllabus.pdf for Calculus I
...

📊 Summary:
  ✅ Created: 15 materials
  ⏭️  Skipped: 0 materials
  📁 Total: 15 materials processed

✅ Seeding completed successfully
```

---

### Step 3: Seed All Platform Data

```bash
pnpm db:seed-all
```

**What this does**:
- ✅ Creates forecast data (projected vs actual revenue for 12 months)
- ✅ Adds system alerts (warnings, info, critical notifications)
- ✅ Sets up subscription plans (Starter, Professional, Enterprise, Individual)
- ✅ Seeds AI chat messages for concierge
- ✅ Creates platform announcements

**Data Created**:

**Forecasts**: 12 months of revenue projections
```
Jan 2025: $42k actual vs $45k projected
Feb 2025: $51k actual vs $48k projected
Mar 2025: $49.5k actual vs $52k projected
... (future months with projections only)
```

**Subscription Plans**:
- **Starter**: $29/mo, 50 students, 5GB storage
- **Professional**: $79/mo, 200 students, 25GB storage
- **Enterprise**: $199/mo, unlimited students, 100GB storage
- **Individual**: $9/mo, personal learning, 1GB storage

**System Alerts**:
- SSL certificate expiration warnings
- Storage limit alerts
- Feature announcements
- Maintenance schedules

**Expected Output**:
```
✅ Authenticated as admin

📊 Seeding forecast data...
✅ Created 12 forecast records

🚨 Seeding system alerts...
✅ Created 5 system alerts

💳 Seeding subscription plans...
✅ Created 4 subscription plans

💬 Seeding chat messages...
✅ Created 2 chat messages

📢 Seeding announcements...
✅ Created 3 announcements

🎉 Summary:
  📊 Forecasts: 12
  🚨 Alerts: 5
  💳 Plans: 4
  💬 Messages: 2
  📢 Announcements: 3

✅ All data seeded successfully!
```

---

## 🧪 Verify Setup

### Check Course Materials in Student Dashboard

1. Login as a student
2. Navigate to **Courses > Materials**
3. You should see:
   - Course materials organized by course
   - Real file names and sizes
   - Upload dates (relative: "Today", "Yesterday", "X days ago")
   - Download buttons that work

### Check Owner Dashboard

1. Login as owner
2. Check **Dashboard**:
   - Revenue forecasts should show chart with projections
   - System alerts should appear
3. Check **Tenant Management > Platform Billing**:
   - Subscription plans should be listed
4. Check **AI Concierge**:
   - Chat should have welcome message

---

## 📁 Collections Created/Updated

| Collection | Records | Purpose |
|------------|---------|---------|
| `file_uploads` | 15+ files | Course materials, assignments, documents |
| `forecasts` | 12 records | Monthly revenue projections |
| `system_alerts` | 5 alerts | Platform notifications |
| `subscription_plans` | 4 plans | Pricing tiers |
| `chat_messages` | 2+ messages | AI concierge history |
| `announcements` | 3 announcements | Platform news |

---

## 🔧 Troubleshooting

### "Collection not found" errors

Some collections might not exist yet in your PocketBase instance. The scripts will skip them gracefully.

**Solution**: Create missing collections via PocketBase Admin UI first.

### "Authentication failed"

Check your `.env` file credentials:
```env
POCKETBASE_ADMIN_EMAIL=owner@growyourneed.com
POCKETBASE_ADMIN_PASSWORD=Darnag123456789@
```

### "Course not found" when seeding materials

The seed script looks for courses by code: `CS101`, `MATH201`, `ENG101`, `PHYS101`.

**Solution**: Either:
1. Create courses with these codes, OR
2. Update the course codes in `seed-course-materials.js` to match your courses

### "No teacher found"

The script needs at least one user with role "Teacher" or "Admin".

**Solution**: Create a teacher/admin user via PocketBase Admin UI first.

---

## 🎯 Next Steps

1. **Upload Real Files**: Now that the collection exists, use the teacher dashboard to upload actual PDF files, presentations, etc.

2. **Customize Data**: Edit the seed scripts to match your specific needs:
   - Add more courses in `seed-course-materials.js`
   - Adjust pricing in `seed-all-data.js`
   - Add custom alerts and announcements

3. **Test Downloads**: Click download buttons in student materials view to verify files are accessible.

4. **Expand**: Create more seed scripts for other collections:
   - Assignments
   - Grades
   - Attendance records
   - Events

---

## 📊 Database Schema

### file_uploads Collection

```typescript
interface FileUpload {
    id: string;
    name: string;                // File display name
    file: File;                  // Actual file blob
    size: number;                // Size in bytes
    type: 'course_material' | 'assignment' | 'profile_picture' | 'document' | 'image' | 'video';
    course_id?: string;          // Relation to courses
    uploaded_by: string;         // Relation to users (required)
    tenant_id?: string;          // Relation to tenants
    description?: string;        // File description
    created: string;             // Auto timestamp
    updated: string;             // Auto timestamp
}
```

### Access Rules

- **List**: `@request.auth.id != null` (any logged-in user)
- **View**: `@request.auth.id != null` (any logged-in user)
- **Create**: `@request.auth.role = "Admin" || @request.auth.role = "Teacher" || @request.auth.role = "Owner"`
- **Update**: `uploaded_by = @request.auth.id || @request.auth.role = "Admin" || @request.auth.role = "Owner"`
- **Delete**: `uploaded_by = @request.auth.id || @request.auth.role = "Admin" || @request.auth.role = "Owner"`

---

## ✅ Success Criteria

After running all scripts, you should have:

- [x] `file_uploads` collection exists with proper schema
- [x] 15+ course materials linked to courses
- [x] 12 months of revenue forecast data
- [x] 4 subscription plans available
- [x] 5+ system alerts visible to admins
- [x] AI chat has welcome messages
- [x] Platform announcements visible
- [x] Students can view and download course materials
- [x] Teachers can upload new materials
- [x] Owner dashboard shows real data (not mock)

---

**Need Help?** Check the script outputs for specific error messages, or review the PocketBase Admin UI to see what collections exist.
