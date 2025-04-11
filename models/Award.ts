import mongoose from "mongoose";

import { Award } from "@/types";

const AwardSchema = new mongoose.Schema<Award>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: { type: String, required: true },
    description: { type: String, required: true },
    earnedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true },
);

// Create indexes for better performance
AwardSchema.index({ userId: 1 });
AwardSchema.index({ type: 1, userId: 1 });

export default mongoose.models.Award ||
  mongoose.model<Award>("Award", AwardSchema);
