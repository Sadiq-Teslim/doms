import prisma from "../prisma.js";

/**
 * Records an audit log entry for a workflow action.
 */
export async function writeAudit({ actorId, action, entity, entityId, details }) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: actorId ?? null,
        action,
        entity,
        entityId: entityId != null ? String(entityId) : null,
        details: details ?? undefined,
      },
    });
  } catch (err) {
    // Audit failures should never break the main operation.
    console.error("Audit write failed:", err.message);
  }
}
