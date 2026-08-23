import AIUsageLog from "../../models/system/AIUsageLog.js";

// ── Get usage stats ───────────────────────────────────────
export const getAIUsageStats = async (startDate, endDate) => {
  try {
    const stats = await AIUsageLog.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      {
        $group: {
          _id: "$feature",
          totalRequests: { $sum: 1 },
          totalTokens: { $sum: "$totalTokens" },
          totalCost: { $sum: "$estimatedCost" },
          avgDuration: { $avg: "$duration" },
          successCount: {
            $sum: { $cond: ["$isSuccess", 1, 0] },
          },
        },
      },
    ]);

    const totals = await AIUsageLog.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          totalTokens: { $sum: "$totalTokens" },
          totalCost: { $sum: "$estimatedCost" },
        },
      },
    ]);

    return {
      byFeature: stats,
      totals: totals[0] || {
        totalRequests: 0,
        totalTokens: 0,
        totalCost: 0,
      },
    };
  } catch (error) {
    console.error(`❌ AI usage stats error: ${error.message}`);
    throw error;
  }
};

// ── Get user usage ────────────────────────────────────────
export const getUserAIUsage = async (userId, limit = 10) => {
  try {
    const usage = await AIUsageLog.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("-prompt -response");

    return usage;
  } catch (error) {
    console.error(`❌ User AI usage error: ${error.message}`);
    throw error;
  }
};