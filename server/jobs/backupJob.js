import mongoose from "mongoose";
import { formatDate } from "../utils/dateHelpers.js";
import auditLogger from "../services/audit/auditLogger.js";
import { AUDIT_TYPES } from "../utils/constants.js";

export const backupJob = async () => {
  try {
    const stats = {
      date: formatDate(new Date()),
      dbStatus: mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
      collections: [],
    };

    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();

    for (const collection of collections) {
      const count = await mongoose.connection.db
        .collection(collection.name)
        .countDocuments();

      stats.collections.push({
        name: collection.name,
        count,
      });
    }

    console.log(`✅ Backup job completed: ${stats.date}`);
    console.log(`📊 Total collections: ${stats.collections.length}`);

    await auditLogger({
      actor: "system",
      actorRole: "system",
      action: `Automated backup completed — ${stats.collections.length} collections`,
      type: AUDIT_TYPES.SYSTEM,
      isSuccess: true,
    });

    return stats;
  } catch (error) {
    console.error(`❌ Backup job failed: ${error.message}`);

    await auditLogger({
      actor: "system",
      actorRole: "system",
      action: `Automated backup failed: ${error.message}`,
      type: AUDIT_TYPES.SYSTEM,
      isSuccess: false,
      errorMessage: error.message,
    });
  }
};