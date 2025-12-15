# 🔐 Security Documentation

**Last Updated**: December 2024  
**Security Level**: Enterprise-Grade  
**Compliance**: GDPR-Ready, SOC 2 Preparation

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Credential Management](#credential-management)
3. [Webhook Security](#webhook-security)
4. [Audit Logging](#audit-logging)
5. [Authentication & Authorization](#authentication--authorization)
6. [Best Practices](#best-practices)
7. [Incident Response](#incident-response)

---

## 🎯 Overview

This document outlines the security measures implemented in the Grow Your Need platform, focusing on the Owner role and critical system components.

### Security Principles:
- **Defense in Depth**: Multiple layers of security
- **Least Privilege**: Minimal access rights
- **Audit Everything**: Comprehensive logging
- **Fail Secure**: Secure defaults, explicit permissions
- **Zero Trust**: Verify everything, trust nothing

---

## 🔑 Credential Management

### Environment Variables

All sensitive credentials are stored in environment variables, never in code.

#### Development/Testing:
```bash
# Copy template
cp .env.example .env.test

# Generate secure passwords
openssl rand -base64 32

# Edit .env.test with your values
```

#### Production:
```bash
# Use secure vault (AWS Secrets Manager, HashiCorp Vault, etc.)
# Never commit .env files to version control
# Rotate credentials every 90 days
```

### Test Credentials

**Location**: `.env.test` (gitignored)

**Structure**:
```bash
TEST_OWNER_EMAIL=owner@test.local
TEST_OWNER_PASSWORD=<secure-random-32-char-password>
TEST_ADMIN_EMAIL=admin@test.local
TEST_ADMIN_PASSWORD=<secure-random-32-char-password>
# ... etc
```

**Usage in Tests**:
```typescript
import { loginAs, getTestCredentials } from '../src/test/helpers/auth';

// Login as owner
await loginAs(page, 'owner');

// Get credentials
const creds = getTestCredentials('owner');
```

### Password Requirements:
- **Minimum Length**: 32 characters
- **Complexity**: Mix of uppercase, lowercase, numbers, special characters
- **Generation**: Use `openssl rand -base64 32` or similar
- **Storage**: Environment variables only
- **Rotation**: Every 90 days

### Credential Rotation Process:

1. **Generate New Credentials**:
   ```bash
   openssl rand -base64 32
   ```

2. **Update Environment Variables**:
   ```bash
   # Update .env files
   # Update CI/CD secrets
   # Update production vault
   ```

3. **Deploy Changes**:
   ```bash
   # Deploy to staging first
   # Test thoroughly
   # Deploy to production
   ```

4. **Verify & Monitor**:
   ```bash
   # Check audit logs
   # Monitor for failed authentications
   # Verify all services working
   ```

5. **Document Rotation**:
   ```bash
   # Log rotation in audit system
   # Update credential inventory
   # Notify team
   ```

---

## 🔐 Webhook Security

### Stripe Webhook Protection

#### Signature Verification (CRITICAL):
```javascript
// ALWAYS verify signatures in ALL environments
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!endpointSecret) {
    return res.status(500).send('Webhook configuration error');
}

event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
```

#### Idempotency:
```javascript
// Prevent duplicate processing
if (processedWebhooks.has(webhookId)) {
    return res.status(200).send('Already processed');
}
processedWebhooks.set(webhookId, Date.now());
```

#### Retry Logic:
```javascript
// Exponential backoff: 1s → 2s → 4s
const WEBHOOK_RETRY_CONFIG = {
    maxRetries: 3,
    retryDelay: 1000,
    backoffMultiplier: 2
};
```

### Configuration:

**Development**:
```bash
STRIPE_WEBHOOK_SECRET=whsec_test_your_test_secret
```

**Production**:
```bash
STRIPE_WEBHOOK_SECRET=whsec_your_production_secret
```

### Testing Webhooks:

```bash
# Use Stripe CLI for local testing
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger invoice.payment_succeeded
```

### Webhook Events Handled:
- ✅ `payment_intent.succeeded` - Updates database, logs with 'low' severity
- ✅ `payment_intent.payment_failed` - Logs with 'high' severity
- ✅ `invoice.payment_succeeded` - Updates invoice status
- ✅ `customer.subscription.*` - Handles create/update/delete
- ✅ `charge.dispute.created` - Logs with 'critical' severity, triggers alert

---

## 📝 Audit Logging

### Overview

Comprehensive audit logging tracks all critical actions with IP addresses, user agents, and severity levels.

### Audit Log Structure:
```javascript
{
  idempotency_key: "uuid-v4",
  action: "webhook.payment_intent.succeeded",
  resource_type: "payment_intent",
  resource_id: "pi_xxx",
  tenant_id: "tenant_123",
  user_id: "user_456",
  severity: "low",
  ip_address: "192.168.1.1",
  user_agent: "Mozilla/5.0...",
  geolocation: {
    country: "US",
    city: "San Francisco",
    region: "California"
  },
  metadata: {
    amount: 5000,
    currency: "usd",
    timestamp_ms: 1234567890
  },
  timestamp: "2024-12-..."
}
```

### Severity Levels:

| Level | Value | Use Case | Alert |
|-------|-------|----------|-------|
| **low** | 1 | Normal operations, successful actions | No |
| **medium** | 2 | Important changes, configuration updates | No |
| **high** | 3 | Failed payments, errors, security events | Optional |
| **critical** | 4 | Disputes, breaches, system failures | Yes |

### Critical Actions (Auto-Alert):
- `webhook.dispute.created`
- `webhook.processing_failed`
- `payment.intent.failed`
- `subscription.cancel`
- `tenant.delete`
- `user.role.change`
- `security.breach`
- `data.export`
- `credentials.rotate`

### Usage:

**Basic Logging**:
```javascript
await logAudit({
    action: 'user.login',
    resourceType: 'user',
    resourceId: userId,
    tenantId: tenantId,
    severity: 'low'
});
```

**With Request Context** (Automatic IP/User Agent):
```javascript
await logAudit({
    action: 'payment.create',
    resourceType: 'payment',
    resourceId: paymentId,
    tenantId: tenantId,
    severity: 'medium',
    req // Express request object
});
```

**Using Middleware** (Recommended):
```javascript
// Middleware automatically attaches audit logger to request
app.use(auditMiddleware);

// In route handler
await req.auditLog({
    action: 'tenant.update',
    resourceType: 'tenant',
    resourceId: tenantId,
    severity: 'medium',
    metadata: { changes: ['plan', 'status'] }
});
```

### Monitoring Endpoints:

**Health Check** (includes audit stats):
```bash
GET /api/health
```

**Audit Statistics**:
```bash
GET /api/admin/audit/stats
# Requires: x-api-key, x-user-role: admin
```

**Flush Buffer**:
```bash
POST /api/admin/audit/flush
# Requires: x-api-key, x-user-role: admin
```

**Query Audit Logs**:
```bash
GET /api/admin/audit?page=1&perPage=50&severity=critical
# Requires: x-api-key, x-user-role: admin, x-tenant-id
```

**Export Audit Logs**:
```bash
GET /api/admin/audit/export?severity=high&from=2024-01-01
# Requires: x-api-key, x-user-role: admin, x-tenant-id
```

---

## 🛡️ Authentication & Authorization

### Row-Level Security (RLS)

PocketBase collections are protected with RLS rules:

```javascript
{
  "listRule": "@request.auth.role = 'Owner'",
  "viewRule": "@request.auth.role = 'Owner'",
  "createRule": "@request.auth.role = 'Owner'",
  "updateRule": "@request.auth.role = 'Owner'",
  "deleteRule": "@request.auth.role = 'Owner'"
}
```

### Protected Collections:
- `tenants` - Owner-only access
- `invoices` - Owner or tenant access
- `audit_logs` - Owner read-only
- `system_alerts` - Owner-only
- `subscription_plans` - Owner manage, all read
- `deals` - Owner-only
- `contacts` - Owner-only

### API Authentication:

**Service API Key**:
```bash
x-api-key: <SERVICE_API_KEY>
```

**User Context**:
```bash
x-user-id: user_123
x-user-role: Owner
x-tenant-id: tenant_456
```

---

## ✅ Best Practices

### For Developers:

1. **Never Hardcode Credentials**
   ```typescript
   // ❌ BAD
   const password = 'MyPassword123';
   
   // ✅ GOOD
   const password = process.env.TEST_OWNER_PASSWORD;
   ```

2. **Always Use Helpers**
   ```typescript
   // ❌ BAD
   await page.fill('input[type="password"]', 'hardcoded');
   
   // ✅ GOOD
   await loginAs(page, 'owner');
   ```

3. **Log All Critical Actions**
   ```typescript
   // ✅ GOOD
   await logAudit({
       action: 'tenant.delete',
       resourceType: 'tenant',
       resourceId: id,
       severity: 'critical',
       req
   });
   ```

4. **Validate Input**
   ```typescript
   // ✅ GOOD
   if (!email || !password) {
       return res.status(400).json({ message: 'Missing required fields' });
   }
   ```

### For Operations:

1. **Monitor Audit Logs Daily**
   ```bash
   # Check for critical events
   GET /api/admin/audit?severity=critical
   ```

2. **Review Failed Authentications**
   ```bash
   # Look for brute force attempts
   GET /api/admin/audit?action=auth.failed
   ```

3. **Flush Audit Buffer Regularly**
   ```bash
   # If PocketBase was down
   POST /api/admin/audit/flush
   ```

4. **Rotate Credentials Quarterly**
   ```bash
   # Every 90 days
   # Use credential rotation script (when created)
   ```

---

## 🚨 Incident Response

### Security Breach Detected:

1. **Immediate Actions**:
   ```bash
   # Rotate all credentials immediately
   # Review audit logs for breach timeline
   # Identify affected resources
   # Notify security team
   ```

2. **Investigation**:
   ```bash
   # Query audit logs
   GET /api/admin/audit?severity=critical&from=<breach-date>
   
   # Check IP addresses
   GET /api/admin/audit?action=<suspicious-action>
   
   # Export for analysis
   GET /api/admin/audit/export
   ```

3. **Remediation**:
   ```bash
   # Patch vulnerability
   # Update security rules
   # Deploy fixes
   # Monitor for recurrence
   ```

4. **Post-Incident**:
   ```bash
   # Document incident
   # Update security procedures
   # Conduct team training
   # Implement additional controls
   ```

### Failed Payment Alert:

1. **Check Audit Logs**:
   ```bash
   GET /api/admin/audit?action=payment.intent.failed
   ```

2. **Review Error Details**:
   ```javascript
   // Audit log includes error message
   metadata: {
       error: "card_declined",
       amount: 5000,
       currency: "usd"
   }
   ```

3. **Take Action**:
   - Contact customer
   - Retry payment
   - Update payment method

### Dispute Created:

1. **Automatic Alert**: Critical severity triggers alert
2. **Review Audit Log**: Check dispute details
3. **Gather Evidence**: Export transaction history
4. **Respond to Stripe**: Within 7 days

---

## 📊 Monitoring & Alerting

### Health Monitoring:
```bash
# Check system health
GET /api/health

# Response includes:
{
  "status": "ok",
  "audit": {
    "buffered": 0,
    "bySeverity": {
      "low": 100,
      "medium": 20,
      "high": 5,
      "critical": 0
    }
  }
}
```

### Alert Configuration:

**Slack Integration** (Optional):
```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx
```

**Email Alerts** (Optional):
```bash
ALERT_EMAIL=security@yourdomain.com
```

**Geolocation** (Optional):
```bash
ENABLE_GEOLOCATION=true
```

---

## 🔒 Data Protection

### Encryption:
- ✅ HTTPS/TLS for all communications
- ✅ Encrypted database connections
- ✅ Secure password hashing (PocketBase default)

### Access Control:
- ✅ Row-Level Security (RLS) in PocketBase
- ✅ API key authentication
- ✅ Role-based access control (RBAC)

### Data Retention:
- Audit logs: 90 days minimum
- Payment records: 7 years (compliance)
- User data: Until account deletion

---

## 📞 Security Contacts

**Security Team**: security@growyourneed.com  
**Incident Response**: incidents@growyourneed.com  
**Bug Bounty**: security-bounty@growyourneed.com

---

## 🎓 Training Resources

1. **Credential Management**: Review `.env.example`
2. **Audit Logging**: Review `server/auditLogger.js`
3. **Webhook Security**: Review `server/index.js` webhook section
4. **Test Authentication**: Review `src/test/helpers/auth.ts`

---

## ✅ Security Checklist

### Before Production:
- [ ] All credentials in environment variables
- [ ] Webhook secrets configured
- [ ] Audit logging enabled
- [ ] Monitoring alerts set up
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] SSL/TLS certificates valid

### Regular Maintenance:
- [ ] Review audit logs weekly
- [ ] Rotate credentials quarterly
- [ ] Update dependencies monthly
- [ ] Security audit annually
- [ ] Penetration testing annually

---

**Document Version**: 1.0  
**Maintained By**: Security Team  
**Review Frequency**: Quarterly
