# Student Module Upgrade Report

## Overview
All files in `src/apps/student` have been reviewed and upgraded to include Zod schema validation for forms and `name` attributes for E2E testing.

## Files Upgraded

### 1. Assignments.tsx
- **Validation**: Uses `SubmitAssignmentModal` which was upgraded.
- **E2E**: Verified integration with the modal.

### 2. SubmitAssignmentModal.tsx (Shared Component)
- **Validation**: Added `submissionSchema` for validating notes.
- **E2E**: Added `name="submissionNotes"` to the notes textarea.
- **Logic**: Updated `handleSubmit` to use `safeParse`.

### 3. ResourceLibrary.tsx
- **E2E**: Added `name="searchResources"` to the search input.

### 4. StudentConcierge.tsx
- **E2E**: Uses shared `RoleBasedAIChat` which was previously upgraded with `name="chatInput"`.

## Read-Only Files (No Changes Needed)
The following files are dashboards or read-only views with no forms:
- `Courses.tsx`
- `Dashboard.tsx`
- `Grades.tsx`
- `Schedule.tsx`
- `StudentProgress.tsx`
- `StudyTools.tsx` (Contains interactive elements like Pomodoro timer, but no data entry forms. "New Deck" button is currently a placeholder).

## Next Steps
- Proceed to the **Parent** module.
- Run E2E tests to verify the new `name` attributes are accessible.
