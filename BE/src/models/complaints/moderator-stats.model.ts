import mongoose, { Schema, Document } from "mongoose";

export interface IModeratorStats extends Document {
  moderatorUserId: mongoose.Types.ObjectId;
  date: Date; // Daily stats (normalized to start of day)

  // Volume metrics
  ticketsAssigned: number;
  ticketsResolved: number;
  ticketsEscalated: number;

  // Time metrics (in minutes)
  avgResolutionTimeMinutes: number;
  avgFirstResponseTimeMinutes: number;
  totalWorkTimeMinutes: number;

  // Resolution breakdown
  fullRefunds: number;
  partialRefunds: number;
  rejections: number;
  replacements: number;

  // Quality metrics
  appealsReceived: number;
  appealsOverturned: number;
  customerSatisfactionScore: number; // 1-5 average

  // SLA compliance
  slaBreaches: number;
  onTimeResolutions: number;

  // Penalty metrics
  penaltiesIssued: number;
  warningsIssued: number;
  suspensionsIssued: number;

  createdAt: Date;
  updatedAt: Date;
}

const ModeratorStatsSchema = new Schema<IModeratorStats>(
  {
    moderatorUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },

    // Volume metrics
    ticketsAssigned: {
      type: Number,
      default: 0,
    },
    ticketsResolved: {
      type: Number,
      default: 0,
    },
    ticketsEscalated: {
      type: Number,
      default: 0,
    },

    // Time metrics
    avgResolutionTimeMinutes: {
      type: Number,
      default: 0,
    },
    avgFirstResponseTimeMinutes: {
      type: Number,
      default: 0,
    },
    totalWorkTimeMinutes: {
      type: Number,
      default: 0,
    },

    // Resolution breakdown
    fullRefunds: {
      type: Number,
      default: 0,
    },
    partialRefunds: {
      type: Number,
      default: 0,
    },
    rejections: {
      type: Number,
      default: 0,
    },
    replacements: {
      type: Number,
      default: 0,
    },

    // Quality metrics
    appealsReceived: {
      type: Number,
      default: 0,
    },
    appealsOverturned: {
      type: Number,
      default: 0,
    },
    customerSatisfactionScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    // SLA compliance
    slaBreaches: {
      type: Number,
      default: 0,
    },
    onTimeResolutions: {
      type: Number,
      default: 0,
    },

    // Penalty metrics
    penaltiesIssued: {
      type: Number,
      default: 0,
    },
    warningsIssued: {
      type: Number,
      default: 0,
    },
    suspensionsIssued: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ModeratorStatsSchema.index({ moderatorUserId: 1, date: -1 });
ModeratorStatsSchema.index({ date: -1 });
ModeratorStatsSchema.index(
  { moderatorUserId: 1, date: 1 },
  { unique: true } // One record per moderator per day
);

export default mongoose.model<IModeratorStats>(
  "ModeratorStats",
  ModeratorStatsSchema
);
