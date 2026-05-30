import prisma from "../prisma.js";

/**
 * Creates an in-app notification targeted at a role (broadcast to all users
 * of that role) and/or a specific user.
 */
export async function createNotification({
  targetRole,
  targetUserId,
  ticketId,
  type,
  message,
}) {
  try {
    await prisma.notification.create({
      data: {
        targetRole: targetRole ?? null,
        targetUserId: targetUserId ?? null,
        ticketId: ticketId ?? null,
        type,
        message,
      },
    });
  } catch (err) {
    console.error("Notification create failed:", err.message);
  }
}
