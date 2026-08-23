import AuditLog from "../../models/system/AuditLog.js";

const auditLogger = async ({
  actor,
  actorRole,
  action,
  type,
  targetModel = null,
  targetId = null,
  previousData = null,
  newData = null,
  ipAddress = null,
  userAgent = null,
  endpoint = null,
  method = null,
  isSuccess = true,
  errorMessage = null,
}) => {
  try {
    await AuditLog.create({
      actor,
      actorRole,
      action,
      type,
      targetModel,
      targetId,
      previousData,
      newData,
      ipAddress,
      userAgent,
      endpoint,
      method,
      isSuccess,
      errorMessage,
    });
  } catch (error) {
    console.error(`❌ Audit log error: ${error.message}`);
  }
};

export default auditLogger;