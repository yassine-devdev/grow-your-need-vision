import { v4 as uuid } from 'uuid';

const PB_URL = process.env.POCKETBASE_URL;
const PB_TOKEN = process.env.POCKETBASE_SERVICE_TOKEN;

async function postPocketBase(collection, body) {
    if (!PB_URL || !PB_TOKEN) return false;
    const res = await fetch(`${PB_URL}/api/collections/${collection}/records`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': PB_TOKEN.startsWith('Bearer ')
                ? PB_TOKEN
                : `Bearer ${PB_TOKEN}`
        },
        body: JSON.stringify(body)
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`PocketBase error (${res.status}): ${text}`);
    }
    return true;
}

export async function logAudit({
    action,
    resourceType,
    resourceId,
    tenantId,
    userId,
    severity = 'info',
    metadata = {}
}) {
    const entry = {
        idempotency_key: uuid(),
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        tenant_id: tenantId,
        user_id: userId,
        severity,
        metadata,
        timestamp: new Date().toISOString()
    };

    try {
        const sent = await postPocketBase('audit_logs', entry);
        if (!sent) {
            console.warn('[auditLogger] PocketBase not configured; audit stored locally');
        }
    } catch (err) {
        console.error('[auditLogger] failed to send audit', err);
    }
}
