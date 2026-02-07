import mongoose from 'mongoose';

/**
 * Report Stats Schema
 * Tracks cumulative statistics for report resolutions
 * Single document that gets updated with counters
 */
const reportStatsSchema = new mongoose.Schema(
    {
        // Use a fixed ID so we always have one document
        _id: {
            type: String,
            default: 'global_stats',
        },
        // Total reports ever resolved
        totalResolved: {
            type: Number,
            default: 0,
        },
        // Breakdown by action type
        dismissed: {
            type: Number,
            default: 0,
        },
        reviewed: {
            type: Number,
            default: 0,
        },
        actionTaken: {
            type: Number,
            default: 0,
        },
        // Breakdown by reason (for resolved reports)
        reasonStats: {
            spam: { type: Number, default: 0 },
            inaccurate: { type: Number, default: 0 },
            duplicate: { type: Number, default: 0 },
            inappropriate: { type: Number, default: 0 },
            already_resolved: { type: Number, default: 0 },
            other: { type: Number, default: 0 },
        },
        // Issues deleted due to reports
        issuesDeleted: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

/**
 * Static method to increment stats when a report is resolved
 */
reportStatsSchema.statics.incrementStats = async function (action, reason, issueDeleted = false) {
    const update = {
        $inc: {
            totalResolved: 1,
        },
    };

    // Increment action-specific counter
    if (action === 'dismissed') {
        update.$inc.dismissed = 1;
    } else if (action === 'reviewed') {
        update.$inc.reviewed = 1;
    } else if (action === 'action_taken') {
        update.$inc.actionTaken = 1;
    }

    // Increment reason counter
    if (reason && this.schema.path(`reasonStats.${reason}`)) {
        update.$inc[`reasonStats.${reason}`] = 1;
    }

    // Increment issues deleted counter
    if (issueDeleted) {
        update.$inc.issuesDeleted = 1;
    }

    return this.findByIdAndUpdate(
        'global_stats',
        update,
        { upsert: true, new: true }
    );
};

/**
 * Static method to get current stats
 */
reportStatsSchema.statics.getStats = async function () {
    let stats = await this.findById('global_stats');
    if (!stats) {
        stats = await this.create({ _id: 'global_stats' });
    }
    return stats;
};

const ReportStats = mongoose.model('ReportStats', reportStatsSchema);

export default ReportStats;
