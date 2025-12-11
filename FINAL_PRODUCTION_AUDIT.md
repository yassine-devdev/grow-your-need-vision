# 🚨 Deep Dive Production Audit

**Date**: 2025-02-20
**Auditor**: GitHub Copilot
**Status**: **CRITICAL SECURITY & ARCHITECTURE FLAWS** ⚠️

---

## 1. Security Vulnerabilities

### 🔴 A. Hardcoded Credentials in Tests
-   **File**: `tests/auth-roles.spec.ts`
-   **Issue**: Real passwords (e.g., `Darnag12345678@`, `12345678`) are hardcoded in the test file.
-   **Risk**: If this repository is public or shared, these credentials are compromised. Even if they are "test" accounts, they often mirror production patterns or are reused.
-   **Fix**: Move test credentials to `.env.test` or use a seed script to generate ephemeral users for testing.

### 🔴 B. Missing API Rules (Inferred)
-   **Observation**: The `pocketbase/pb_migrations` folder exists, but the application logic relies heavily on client-side filtering (e.g., `ownerService.ts`).
-   **Risk**: If API rules (RLS) are not strictly enforced on the backend, a malicious user can simply bypass the frontend filters and query *all* data (e.g., `pb.collection('tenants').getFullList()`).
-   **Fix**: Audit `pb_schema.json` or the Admin UI to ensure every collection has `@request.auth.id != ""` or stricter rules.

### 🟠 C. `any` Type Usage
-   **Issue**: `grep` found 20+ instances of `any` in `src/utils/performance.ts` and `src/utils/logger.ts`.
-   **Risk**: This bypasses TypeScript's safety net, leading to potential runtime errors that the build process won't catch.
-   **Fix**: Replace `any` with `unknown` or specific interfaces.

---

## 2. Architecture & Scalability

### 🔴 A. The "Workaround" is Fatal
-   **Issue**: As noted before, `ownerService.ts` fetches *all* records to filter in memory.
-   **New Insight**: This pattern likely exists because the backend schema is missing indices on `created` and `updated` fields.
-   **Consequence**: This is O(n) complexity on the client. It *will* crash the browser.
-   **Fix**: Add indices to `created` and `updated` columns in PocketBase and revert to server-side filtering.

### 🟠 B. State Management
-   **Issue**: The app relies heavily on `useEffect` to fetch data on mount.
-   **Risk**: This leads to "waterfall" loading (slow page renders) and redundant API calls if the user navigates back and forth.
-   **Fix**: Implement a caching layer (TanStack Query / React Query) to manage server state efficiently.

---

## 3. Infrastructure & DevOps

### 🔴 A. Hardcoded `localhost` (Confirmed)
-   **File**: `src/lib/pocketbase.ts` uses `import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090'`.
-   **Issue**: While it *tries* to use an env var, many other files (found in previous step) bypass this and instantiate `new PocketBase('http://127.0.0.1:8090')` directly.
-   **Fix**: **Global Search & Replace** to ensure *every* file imports the singleton from `src/lib/pocketbase.ts`.

### 🟠 B. Docker Secrets
-   **Issue**: `docker-compose.yml` contains cleartext passwords.
-   **Fix**: Use Docker Secrets or `.env` file injection.

---

## 4. Recommendations

1.  **Immediate Security Patch**: Remove hardcoded passwords from `tests/`.
2.  **Refactor Networking**: Force all services to use the `src/lib/pocketbase.ts` singleton.
3.  **Database Optimization**: Add indices to PocketBase collections to enable server-side sorting/filtering and remove the client-side workaround.
4.  **Secrets Management**: scrub all secrets from the codebase.

---
**Signed**: GitHub Copilot
