# 🌱 Quick Start - Database Seeding

## Prerequisites

1. **PocketBase is running**:
   ```bash
   # Start PocketBase (from pocketbase folder)
   ./pocketbase serve
   
   # Should see: Server started at http://127.0.0.1:8090
   ```

2. **Create collections** (if not already created):
   - Go to http://127.0.0.1:8090/_/
   - Create the required collections (see POCKETBASE_SETUP_GUIDE.md)
   - Or the script will fail if collections don't exist

## Run Seeding

```bash
node seed-all-data.cjs
```

## What Gets Created

- ✅ 7 Users (Admin, Teachers, Students, Parent)
- ✅ 3 Classes
- ✅ 5 Subjects
- ✅ Gamification data (achievements, rewards, progress)
- ✅ Sport data (teams, venues)
- ✅ Travel destinations
- ✅ Help center (FAQs, articles)
- ✅ Religious content (events, verses)

## Login After Seeding

**Admin**: `admin@school.com` / `Admin123!@#`  
**Teacher**: `john.teacher@school.com` / `Teacher123!@#`  
**Student**: `alice.student@school.com` / `Student123!@#`

## Troubleshooting

**"Collection doesn't exist"**:
- Create the collection in PocketBase admin first
- Collection name must match exactly

**"PocketBase not running"**:
- Start PocketBase: `./pocketbase serve`
- Check http://127.0.0.1:8090 is accessible

**"Duplicate email"**:
- Data already exists
- Delete users from PocketBase admin and re-run

---

**Ready!** Run `node seed-all-data.cjs` 🚀
