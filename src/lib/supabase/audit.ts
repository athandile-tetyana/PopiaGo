import { createClient } from './server'
import { createServiceClient } from './service'

export type AuditAction = 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'status_change' 
  | 'generate'
  | 'ropa_create'
  | 'ropa_update'
  | 'ropa_delete'
  | 'paia_save'
  | 'dsar_update'

export type AuditEntityType = 'processing_activity' | 'paia_manual' | 'dsar_request' | 'organization' | 'compliance_document'

interface LogAuditParams {
  orgId: string
  actorUserId?: string
  action: AuditAction
  entityType: AuditEntityType
  entityId?: string
  details?: Record<string, any>
}

/**
 * Logs an action to the audit_logs table.
 * Uses the service client to ensure logs are captured even for public events.
 */
export async function logAuditEvent({
  orgId,
  actorUserId,
  action,
  entityType,
  entityId,
  details,
}: LogAuditParams) {
  // Use service client to bypass RLS for audit writes
  const supabase = createServiceClient()

  // If actorUserId is not provided, try to get it from the session
  let effectiveUserId = actorUserId
  if (!effectiveUserId) {
    const userClient = await createClient()
    const { data: { user } } = await userClient.auth.getUser()
    effectiveUserId = user?.id
  }

  const { error } = await supabase.from('audit_logs').insert({
    org_id: orgId,
    user_id: effectiveUserId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details,
  })

  if (error) {
    console.error('Failed to write audit log:', error)
  }
}

// Keep logAudit as an alias for backward compatibility during transition if needed
export const logAudit = logAuditEvent
