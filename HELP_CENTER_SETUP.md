# Help Center App - PocketBase Collections Setup

## Required Collections

### 1. `help_faqs`
**Purpose**: Frequently Asked Questions

```javascript
{
  "category": "select (Account, Billing, Technical, Features, General)",
  "question": "text (required)",
  "answer": "text (required, editor)",
  "views": "number (default: 0)",
  "helpful_count": "number (default: 0)",
  "order": "number (display order within category)"
}
```

**Indexes**: `category`, `order`

### 2. `support_tickets`
**Purpose**: User support requests

```javascript
{
  "user": "relation (users, required)",
  "subject": "text (required)",
  "description": "text (required, editor)",
  "category": "select (Technical, Billing, Feature Request, Bug Report, Other)",
  "priority": "select (Low, Medium, High, Urgent)",
  "status": "select (Open, In Progress, Waiting, Resolved, Closed)",
  "assigned_to": "relation (users, optional)",
  "attachments": "file (multiple, optional)"
}
```

**Indexes**: `user`, `status`, `created`

### 3. `ticket_replies`
**Purpose**: Conversation threads on tickets

```javascript
{
  "ticket": "relation (support_tickets, required)",
  "user": "relation (users, required)",
  "message": "text (required, editor)",
  "is_staff": "bool (default: false)"
}
```

**Indexes**: `ticket`, `created`

### 4. `knowledge_articles`
**Purpose**: Detailed help documentation

```javascript
{
  "title": "text (required)",
  "content": "text (required, editor)",
  "category": "select (Getting Started, Advanced, Troubleshooting, API, Best Practices)",
  "tags": "json (array of strings)",
  "views": "number (default: 0)",
  "helpful_count": "number (default: 0)",
  "author": "relation (users, required)",
  "published": "bool (default: false)"
}
```

**Indexes**: `category`, `published`, `views`

---

## Sample Data

### Sample FAQs

```javascript
// Account FAQ
{
  "category": "Account",
  "question": "How do I reset my password?",
  "answer": "To reset your password:\n1. Click 'Forgot Password' on the login page\n2. Enter your email address\n3. Check your email for the reset link\n4. Click the link and create a new password\n5. Log in with your new password",
  "views": 1250,
  "helpful_count": 890,
  "order": 1
}

// Billing FAQ
{
  "category": "Billing",
  "question": "How do I update my payment information?",
  "answer": "Navigate to Settings → Billing → Payment Methods. Click 'Add Payment Method' to add a new card or 'Edit' to update existing information. All payment data is securely encrypted.",
  "views": 750,
  "helpful_count": 450,
  "order": 1
}

// Technical FAQ
{
  "category": "Technical",
  "question": "Why am I getting a 'Connection Error'?",
  "answer": "Connection errors can occur due to:\n- Weak internet connection\n- Server maintenance\n- Browser cache issues\n\nTry:\n1. Refresh the page\n2. Clear browser cache\n3. Check your internet connection\n4. Try a different browser",
  "views": 3200,
  "helpful_count": 1890,
  "order": 1
}
```

### Sample Support Ticket

```javascript
{
  "user": "user_id_123",
  "subject": "Unable to upload files larger than 10MB",
  "description": "I'm trying to upload a 15MB PDF file but keep getting an error message. The upload bar reaches about 80% then fails with 'Upload failed - file too large'.\n\nI'm using Chrome on Windows 11.\n\nPlease help!",
  "category": "Technical",
  "priority": "Medium",
  "status": "Open",
  "assigned_to": null,
  "attachments": []
}
```

### Sample Knowledge Article

```javascript
{
  "title": "Getting Started with GROW YOUR NEED",
  "content": "# Welcome to GROW YOUR NEED!\n\n## Quick Start Guide\n\n### 1. Set Up Your Profile\nComplete your profile to personalize your experience...\n\n### 2. Explore Features\nNavigate through our comprehensive platform...\n\n### 3. Connect with Others\nBuild your network by...",
  "category": "Getting Started",
  "tags": ["beginner", "tutorial", "onboarding"],
  "views": 5400,
  "helpful_count": 3200,
  "author": "admin_user_id",
  "published": true
}
```

---

## API Rules (PocketBase)

### `help_faqs`
```javascript
// List/View
@request.auth.id != ""

// Create/Update/Delete
@request.auth.role ~ "Admin|Support"
```

### `support_tickets`
```javascript
// List/View
@request.auth.id = user.id || 
@request.auth.role ~ "Admin|Support"

// Create
@request.auth.id = @request.data.user

// Update
@request.auth.id = user.id || 
@request.auth.role ~ "Admin|Support"

// Delete
@request.auth.role = "Admin"
```

### `ticket_replies`
```javascript
// List/View
@request.auth.id = ticket.user.id || 
@request.auth.role ~ "Admin|Support"

// Create
@request.auth.id = @request.data.user ||
@request.auth.role ~ "Admin|Support"

// Update/Delete
@request.auth.role = "Admin"
```

### `knowledge_articles`
```javascript
// List/View (published only for regular users)
published = true || 
@request.auth.role ~ "Admin|Support"

// Create
@request.auth.role ~ "Admin|Support"

// Update
@request.auth.id = author.id || 
@request.auth.role = "Admin"

// Delete
@request.auth.role = "Admin"
```

---

## Features to Implement

### Auto-Responses
Create triggers to send automatic emails when:
- Ticket is created
- Ticket status changes
- New reply is added

### SLA Tracking
Monitor response times:
- Urgent: < 1 hour
- High: < 4 hours
- Medium: < 24 hours
- Low: < 48 hours

### Smart Search
Implement full-text search across:
- FAQ questions/answers
- Knowledge articles
- Ticket history

---

**Status**: Collections defined  
**Setup Time**: 15-20 minutes  
**Next**: Create collections + add sample FAQs
