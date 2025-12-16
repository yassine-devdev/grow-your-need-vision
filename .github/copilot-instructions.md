# Copilot Instructions for Grow Your Need Platform

## Architecture Overview

This is a **multi-tenant SaaS platform** with three main services:

- **Frontend** (React/Vite at `:3000`) - Role-based dashboards with overlay app system
- **PocketBase** (`:8090`) - Backend/database with collections and real-time subscriptions
- **AI Service** (Python/FastAPI at `:8000`) - RAG-powered concierge with ChromaDB
- **Payment Server** (Express at `:3001`) - Stripe integration with audit logging

### Role-Based Access Pattern

Six user roles with dedicated layouts in `src/components/layout/`:

- `Owner` → `/admin` (platform-wide management)
- `SchoolAdmin` → `/school-admin` (tenant administration)
- `Teacher` → `/teacher`, `Student` → `/student`, `Parent` → `/parent`
- `Individual` → `/individual` (personal use)

Route protection uses `ProtectedRoute` + `RoleBasedRedirect` components.

## Key Conventions

### Configuration-Driven UI

Navigation and apps are **data-driven** via `src/data/AppConfigs.ts`:

- `NAV_CONFIG` - Owner sidebar modules with tabs/subnav
- `SCHOOL_ADMIN_CONFIG`, `TEACHER_CONFIG`, etc. - Role-specific nav
- `OVERLAY_CONFIG` - Dock app configurations (tabs + subnav structure)

**When adding features, update these configs first** rather than hardcoding navigation.

### Service Layer Pattern

All backend calls go through `src/services/*Service.ts`:

```typescript
import pb from "../lib/pocketbase";
import { isMockEnv } from "../utils/mockData";

// 1. Define interface extending RecordModel for type safety
export interface MyRecord extends RecordModel {
  name: string;
  tenantId?: string;
}

// 2. Provide MOCK_DATA for E2E tests
const MOCK_DATA: MyRecord[] = [
  /* ... */
];

// 3. Check isMockEnv() first, then call PocketBase
export const myService = {
  async fetchData(tenantId?: string) {
    if (isMockEnv()) return MOCK_DATA;
    return pb.collection("myCollection").getFullList<MyRecord>({
      filter: tenantId ? `tenantId = "${tenantId}"` : "",
      requestKey: null, // Prevent auto-cancellation issues
    });
  },
};
```

### Data Query Hooks

Use `useDataQuery<T>` or `usePocketBase<T>` for reactive data fetching with built-in pagination, sorting, and realtime support:

```typescript
const { items, loading, setFilter, refresh } = useDataQuery<Student>(
  "students",
  {
    filter: `tenantId = "${tenantId}"`,
    sort: "-created",
    realtime: true,
  }
);
```

### Overlay Apps (Dock Applications)

Apps launched from the dock live in `src/apps/` and receive standard props:

```typescript
interface AppProps {
  activeTab: string;
  activeSubNav: string;
  onNavigate: (tab: string, subNav?: string) => void;
}
```

Register new apps in: 1) `OVERLAY_CONFIG` 2) `AppOverlay.tsx` switch statement.

### UI Component Patterns

- Use `cn()` from `src/lib/utils.ts` for Tailwind class merging
- Import shared components from `src/components/shared/ui/CommonUI.tsx`
- Custom colors use `gyn-*`, `hud-*`, `material-*` prefixes (see `tailwind.config.js`)
- Dark mode: Use `dark:` prefix, controlled via `ThemeContext`

## Development Commands

```powershell
pnpm dev              # Start all services (frontend + PocketBase + AI + server)
pnpm test:e2e         # Run Playwright tests (uses mock auth when PB unavailable)
pnpm test:e2e --ui    # Debug tests visually
pnpm lint             # ESLint check
```

### Windows PowerShell Scripts

```powershell
.\launch.ps1          # Full stack launcher (recommended for first-time setup)
.\init-pocketbase.ps1 # Initialize PocketBase with migrations
.\setup-users.ps1     # Create test users for all roles
.\launch-ai.ps1       # Start AI service with venv activation
.\stop-servers.ps1    # Gracefully stop all background services
```

### Database Scripts (PocketBase Collections)

```powershell
node scripts/init-schema.js        # Core collections (messages, wellness_logs, classes)
node scripts/init-school-schema.js # School-specific (students, teachers, grades)
node scripts/seed-data.js          # Seed test data for all roles
# Pattern: init-{feature}-schema.js + seed-{feature}-data.js
```

**Auth for scripts:** Uses `_superusers` collection with `owner@growyourneed.com`.

## Multi-Tenancy Pattern

All tenant-scoped data includes a `tenantId` field:

```typescript
// Services MUST filter by tenant to prevent cross-tenant data leaks
const records = await pb.collection("courses").getFullList({
  filter: `tenantId = "${user.tenantId}"`,
});
```

- `SchoolProvider` (`src/apps/school/SchoolContext.tsx`) provides tenant context
- Owner role sees all tenants; other roles are scoped to their `tenantId`
- PocketBase rules enforce tenant isolation at database level

## Testing Conventions

E2E tests use **synthetic login via `isMockEnv()`** when `navigator.webdriver === true`:

- Test users: `teacher@school.com` (pw: `123456789`), `student@school.com`, `admin@school.com` (pw: `12345678`)
- Use `data-testid` attributes for test selectors (e.g., `data-testid="welcome-msg"`)
- App launcher button selector: `button.w-16.h-16.rounded-full`

## Context Providers

Wrap order matters (`App.tsx`):

```
AuthProvider > OSProvider > ThemeProvider > RealtimeProvider > ModalProvider > ToastProvider
```

- `OSContext` - Overlay apps, sidebar state, window management
- `AuthContext` - Login, logout, impersonation, role checking
- `RealtimeContext` - PocketBase subscriptions, notifications, presence
- `SchoolProvider` - Tenant-scoped user/stats data

## File Organization

| Directory                          | Purpose                                     |
| ---------------------------------- | ------------------------------------------- |
| `src/apps/{appName}/`              | Feature app with components subdirectory    |
| `src/services/{feature}Service.ts` | API/data layer with mock fallbacks          |
| `src/data/*.ts`                    | Static configs, constants, role definitions |
| `src/hooks/use*.ts`                | Reusable React hooks (70+ available)        |
| `src/components/shared/ui/`        | 90+ reusable UI components                  |
| `scripts/init-*.js`                | PocketBase schema initialization            |
| `scripts/seed-*.js`                | Data seeding scripts                        |

## AI Service Notes

- Uses ChromaDB for vector storage (`ai_service/chroma_db/`)
- Ingests `docs/` folder on startup for RAG context
- Model routing via `model_router.py` (OpenAI/Gemini)
- Endpoints: `/chat`, `/search`, `/ingest`

## Observability (Optional)

Server (`server/index.js`) supports:

- Sentry: Set `SENTRY_DSN` env var
- OpenTelemetry: Set `OTEL_EXPORTER_OTLP_ENDPOINT`
- Metrics at `/api/metrics` (Prometheus format)
- Audit logging for finance exports

## Environment Configuration

Use `src/config/environment.ts` for all env vars (never hardcode URLs):

```typescript
import env from "../config/environment";
const pbUrl = env.get("pocketbaseUrl");
if (env.isFeatureEnabled("payments")) {
  /* ... */
}
```

Key `.env` variables: `VITE_POCKETBASE_URL`, `STRIPE_SECRET_KEY`, `AI_SERVICE_URL`, `OPENAI_API_KEY`

## EduMultiverse (Gamified Learning)

Located in `src/apps/edumultiverse/` - a gamified learning system with:

- **MultiverseHUD** - XP, levels, streaks overlay
- **Screens**: MultiverseMap, ConceptFusion, GlitchHunter, QuantumQuiz, TimeLoopMission
- Uses `useGamification()` hook for progress tracking
- Routes under `/apps/edumultiverse/*`

## Creator Studio

Full-featured content creation suite (`src/apps/CreatorStudio.tsx`):

- **Designer** - Polotno-based design editor
- **Video** - Video editing with timeline
- **Coder** - Monaco-based code editor
- **Office** - Word/Excel/PowerPoint tools
- AI content generation via `AIContentGeneratorModal`

## Stripe Integration

Payments use `StripeContext` + `StripeProvider`:

- Feature-flagged via `env.isFeatureEnabled('payments')`
- Server handles webhooks at `/api/stripe/webhook`
- Uses `Elements` wrapper from `@stripe/react-stripe-js`

## Concierge AI System

Role-aware AI assistant (`src/apps/concierge_ai/`):

- **AIAssistant** - Chat interface with voice input/output (`useSpeechRecognition`, `useSpeechSynthesis`)
- **LocalIntelligence** - Role-based query processing with context-aware responses
- **useChat hook** - Manages conversation history with smart caching (24h expiry, 50 message limit)
- System prompts vary by role (Owner gets debugging help, Student gets learning focus, etc.)

### AI Endpoints

```typescript
// Frontend calls AI service
const response = await fetch(`${env.get("aiServiceUrl")}/chat`, {
  method: "POST",
  body: JSON.stringify({ query, context, role }),
});
```

## Video Editor (Remotion)

Full video editing in `src/apps/media/`:

- Uses `@remotion/player` for preview, `@remotion/renderer` for export
- Templates: Educational, Corporate, Minimal (`src/apps/media/templates/`)
- Components: `MediaUploader`, `AudioSelector`, `Timeline`
- Export formats: MP4, WebM via `VideoExportService`

## CRM Module

Platform CRM (`src/apps/crm/`) and School CRM (`src/apps/school/crm/`):

- **ContactsManager** - Lead/contact management
- **DealAssignment** - Sales pipeline with stages
- **CRMAnalytics** - Conversion tracking, forecasts
- **EmailIntegration** - Bulk messaging, templates

## Project Knowledge Base

Role-specific AI knowledge in `src/data/projectKnowledge.ts`:

```typescript
import { getRoleKnowledge } from "../data/projectKnowledge";
const knowledge = getRoleKnowledge(user.role); // Returns role-appropriate context
```

Used by AI to understand platform features per role.

## Key Hooks Reference

| Hook                           | Purpose                               |
| ------------------------------ | ------------------------------------- |
| `useGamification()`            | XP, levels, streaks for EduMultiverse |
| `useChat(context)`             | AI conversation with caching          |
| `useDataQuery<T>(collection)`  | Paginated PocketBase queries          |
| `usePocketBase<T>(collection)` | Simple reactive fetching              |
| `useSpeechRecognition()`       | Voice input for AI chat               |
| `useRealtime()`                | PocketBase subscription management    |
| `useFileUpload()`              | S3/PocketBase file uploads            |
| `useForm()`                    | Form state with validation            |

## Role-Specific Dashboards

### Owner (`src/apps/owner/`)

- **TenantDashboard** - Manage schools/organizations
- **FeatureFlags** - Toggle platform features by plan/rollout percentage
- **SystemHealthDashboard** - Server metrics, uptime
- **AuditLogs** - Track admin actions
- **WebhookManager** - Configure integrations
- **BackupManager** - Database backups

### Teacher (`src/apps/teacher/`)

- **LessonPlanner** - AI-assisted lesson creation
- **GradeBook** - Student assessment with mastery view
- **AttendanceMarking** - Daily attendance
- **Classes** - Class management
- **Communication** - Parent messaging

### Student (`src/apps/student/`)

- **Dashboard** - Course overview, upcoming assignments
- **Courses** - Enrolled courses with materials
- **Assignments** - Submit work, view feedback
- **Schedule** - Timetable view
- **StudentConcierge** - AI study assistant

### Individual (`src/apps/individual/`)

- **Projects** - Kanban-style project management
- **Goals** - Personal goal tracking
- **Learning** - Course access
- **Skills** - Skill development tracking
- **Marketplace** - Template/asset store

## Wellness Module

Full wellness tracking (`src/apps/Wellness.tsx`):

- **Activity tracking** - Steps, calories, sleep
- **Mood logging** - Daily mood tracking
- **Meal planning** - AI-generated meal plans via `AIContentGeneratorModal`
- **Reports** - Export wellness data via `reportService`

## File Upload Pattern

Use `FileUploadService` for PocketBase uploads:

```typescript
import { fileUploadService } from "../services/fileUploadService";

// Single file upload
const result = await fileUploadService.uploadFile(
  file,
  "collection",
  recordId,
  "fieldName"
);

// Multiple files
const result = await fileUploadService.uploadFiles(
  files,
  "collection",
  recordId,
  "fieldName"
);
```

## Feature Flags System

Owner can control features via `src/apps/owner/FeatureFlags.tsx`:

- Categories: `core`, `ai`, `payment`, `communication`, `analytics`, `overlay`
- Rollout percentage support (0-100%)
- Plan restrictions (e.g., Premium-only features)
- All changes are audit-logged

## Parent Dashboard (`src/apps/parent/`)

- **Dashboard** - Child overview with grades, attendance
- **Academic** - View child's courses and assignments
- **Grades** - Grade reports and transcripts
- **Attendance** - Absence tracking
- **Finance** - Tuition payments, invoices
- **Communication** - Message teachers
- **Schedule** - School calendar view

## School Finance Module (`src/apps/school/finance/`)

- **FinancialReports** - Revenue, expenses, P&L
- **FeeStructure** - Define tuition and fee types
- **InvoiceList** - Generate/send invoices to parents
- **ExpenseManager** - Track school expenses
- **Payroll** - Staff salary management

## Report Export Service

`src/services/reportService.ts` provides PDF/Excel exports:

```typescript
import { reportService } from "../services/reportService";

// Export to PDF with table
reportService.exportToPDF(
  "Title",
  ["Col1", "Col2"],
  [["row1", "data"]],
  "filename"
);

// Export to Excel
reportService.exportToExcel(dataArray, "SheetName", "filename");
```

Uses `jsPDF` + `jspdf-autotable` for PDF, `xlsx` for Excel.

## AI Content Generation Modal

Reusable modal for AI-generated content (`src/components/shared/modals/AIContentGeneratorModal.tsx`):

```typescript
<AIContentGeneratorModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onSuccess={(content) => handleAIContent(content)}
  title="Generate Lesson Plan"
  promptTemplate="Create a lesson plan for..."
  contextData={{ subject: "Math", grade: "10" }}
/>
```

Used in: Lesson Planner, Grade Feedback, Meal Planning, Finance Reports.

## AI Service Pattern

`src/services/aiService.ts` provides unified AI access:

- Falls back to local heuristic engine if no API key configured
- Supports OpenAI endpoint (configurable)
- API key from `VITE_OPENAI_API_KEY` or localStorage

## Common Modals (`src/components/shared/modals/`)

| Modal                     | Purpose                       |
| ------------------------- | ----------------------------- |
| `AIContentGeneratorModal` | AI-powered content generation |
| `AssignmentModal`         | Create/edit assignments       |
| `GradeSubmissionModal`    | Enter student grades          |
| `EnrollmentModal`         | Student enrollment forms      |
| `BroadcastMessageModal`   | Send bulk messages            |
| `SubmitAssignmentModal`   | Student assignment submission |

## Overlay Apps Reference

### MediaApp (`src/apps/MediaApp.tsx`)

- Browse movies, series, documentaries
- **Live TV** - M3U playlist support, channel syncing
- Video player component with HLS support
- Playlist management per user

### MarketApp (`src/apps/MarketApp.tsx`)

- E-commerce with product catalog
- Shopping cart with variant support
- Multi-step checkout (Shipping → Payment → Confirm)
- Medusa.js integration for backend

### ReligionApp (`src/apps/ReligionApp.tsx`)

- **Dashboard** - Daily verse, hadith, prayer times
- **Quran** - Full reader with surah list, translations
- **Prayer** - Times, Qibla finder, tracker
- **Tools** - Tasbih counter, Zakat calculator, Inheritance calculator
- **Soul Prescription** - AI mood-based verse recommendations

### SportApp (`src/apps/SportApp.tsx`)

- Live match scores with real-time updates
- Team/league management
- Activity logging per user
- Multiple sports: Football, Basketball, Tennis, etc.

### ActivitiesApp (`src/apps/ActivitiesApp.tsx`)

- Community events discovery
- Filtering by category, location, date
- List/table view toggle
- Pagination support

## Form Handling

Use `useForm<T>` hook for controlled forms:

```typescript
import { useForm } from "../hooks/useForm";

const { values, handleChange, resetForm, setFieldValue } = useForm({
  name: "",
  email: "",
  agreed: false,
});

<input name="name" value={values.name} onChange={handleChange} />;
```

## Toast Notifications

Use `useToast` hook for user feedback:

```typescript
import { useToast } from "../hooks/useToast";

const { addToast, showToast } = useToast();
addToast("Success message", "success"); // success | error | warning | info
```

## Loading States

Prefer skeleton loaders from `src/components/shared/ui/`:

- `<Skeleton />` - Basic skeleton element
- `<SkeletonCard />` - Card-shaped skeleton
- `<LoadingScreen />` - Full page loader
