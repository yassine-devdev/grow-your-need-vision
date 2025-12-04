# Manual Collection Setup Guide

## Collections Successfully Created ✅
- `school_settings` 
- `recommendations` 

## Collections To Create Manually

Due to PocketBase API limitations with relation fields, please create these collections manually in the PocketBase Admin UI:

### Access PocketBase Admin
1. Open http://127.0.0.1:8090/_/
2. Login with your admin credentials
3. Go to **Collections** tab
4. Click **+ New collection** for each below

---

## 1. individual_courses

**Type**: Base collection

**Fields**:
| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| user | Relation | ✅ | Collection: `users`, Cascade delete: ON, Max select: 1 |
| course_title | Text | ✅ | Min: 1, Max: 200 |
| course_description | Text | ❌ | Max: 2000 |
| course_image | File | ❌ | Max select: 1, Max size: 5MB |
| progress | Number | ✅ | Min: 0, Max: 100 |
| enrolled_date | Date | ✅ | |
| completed_date | Date | ❌ | |
| status | Select | ✅ | Values: `active`, `completed`, `paused` |

**API Rules**:
- List: `@request.auth.id = user.id || @request.auth.role = "Owner"`
- View: `@request.auth.id = user.id || @request.auth.role = "Owner"`
- Create: `@request.auth.id != ""`
- Update: `@request.auth.id = user.id || @request.auth.role = "Owner"`
- Delete: `@request.auth.id = user.id || @request.auth.role = "Owner"`

---

## 2. wellness_data

**Type**: Base collection

**Fields**:
| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| user | Relation | ✅ | Collection: `users`, Cascade delete: ON, Max select: 1 |
| date | Date | ✅ | |
| mood_score | Number | ✅ | Min: 1, Max: 10 |
| energy_level | Number | ✅ | Min: 1, Max: 10 |
| stress_level | Number | ✅ | Min: 1, Max: 10 |
| sleep_hours | Number | ❌ | Min: 0, Max: 24 |
| water_intake | Number | ❌ | Min: 0, Max: 50 |
| steps | Number | ❌ | Min: 0 |
| exercise_minutes | Number | ❌ | Min: 0, Max: 1440 |
| meditation_minutes | Number | ❌ | Min: 0, Max: 1440 |

**API Rules**:
- List: `@request.auth.id = user.id || @request.auth.role = "Owner"`
- View: `@request.auth.id = user.id || @request.auth.role = "Owner"`
- Create: `@request.auth.id != ""`
- Update: `@request.auth.id = user.id`
- Delete: `@request.auth.id = user.id`

---

## 3. marketplace_orders

**Type**: Base collection

**Fields**:
| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| user | Relation | ✅ | Collection: `users`, Cascade delete: OFF, Max select: 1 |
| order_number | Text | ✅ | Min: 1, Max: 100 |
| product_name | Text | ✅ | Min: 1, Max: 200 |
| product_image | File | ❌ | Max select: 1, Max size: 5MB |
| quantity | Number | ✅ | Min: 1 |
| price | Number | ✅ | Min: 0 |
| status | Select | ✅ | Values: `pending`, `processing`, `shipped`, `delivered`, `cancelled` |
| order_date | Date | ✅ | |
| tracking_number | Text | ❌ | Max: 200 |

**API Rules**:
- List: `@request.auth.id = user.id || @request.auth.role = "Owner"`
- View: `@request.auth.id = user.id || @request.auth.role = "Owner"`
- Create: `@request.auth.id != ""`
- Update: `@request.auth.role = "Owner" || @request.auth.role = "Admin"`
- Delete: `@request.auth.role = "Owner"`

---

## 4. service_bookings

**Type**: Base collection

**Fields**:
| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| user | Relation | ✅ | Collection: `users`, Cascade delete: OFF, Max select: 1 |
| service_name | Text | ✅ | Min: 1, Max: 200 |
| service_provider | Text | ✅ | Min: 1, Max: 200 |
| booking_date | Date | ✅ | |
| booking_time | Text | ✅ | Max: 20 |
| duration_minutes | Number | ✅ | Min: 15, Max: 480 |
| status | Select | ✅ | Values: `upcoming`, `completed`, `cancelled` |
| price | Number | ✅ | Min: 0 |
| location | Text | ❌ | Max: 500 |

**API Rules**:
- List: `@request.auth.id = user.id || @request.auth.role = "Owner"`
- View: `@request.auth.id = user.id || @request.auth.role = "Owner"`
- Create: `@request.auth.id != ""`
- Update: `@request.auth.id = user.id || @request.auth.role = "Owner"`
- Delete: `@request.auth.id = user.id || @request.auth.role = "Owner"`

---

## 5. individual_goals

**Type**: Base collection

**Fields**:
| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| user | Relation | ✅ | Collection: `users`, Cascade delete: ON, Max select: 1 |
| goal_text | Text | ✅ | Min: 1, Max: 500 |
| goal_type | Select | ✅ | Values: `daily`, `weekly`, `monthly`, `yearly` |
| is_completed | Bool | ✅ | |
| due_date | Date | ❌ | |
| completed_date | Date | ❌ | |

**API Rules**:
- List: `@request.auth.id = user.id || @request.auth.role = "Owner"`
- View: `@request.auth.id = user.id || @request.auth.role = "Owner"`
- Create: `@request.auth.id != ""`
- Update: `@request.auth.id = user.id`
- Delete: `@request.auth.id = user.id`

---

## After Creating Collections

Run the seed script to populate with test data:
```bash
node seed-phase1-data.cjs
```

This will create:
- Test Individual user (email: `individual.user@test.com`, password: `TestPassword123!`)
- 3 sample courses
- 7 days of wellness data
- 3 marketplace orders
- 2 service bookings
- 3 recommendations
- 4 goals

---

**Estimated Time**: 10-15 minutes  
**Difficulty**: Easy (point-and-click in PocketBase Admin UI)

## Tips
- Copy field names exactly as written (case-sensitive)
- For Relation fields, select "users" from the dropdown
- For Select fields, enter values separated by commas or use the "Add value" button
- Save each collection before moving to the next
