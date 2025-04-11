import mongoose from "mongoose";

import { Post } from "@/types";

const PostSchema = new mongoose.Schema<Post>(
  {
    type: {
      type: String,
      enum: ["general", "event", "poll", "petition", "announcement"],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    summarizedDescription: { type: String },
    locality: { type: String, required: true },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pollId: { type: mongoose.Schema.Types.ObjectId, ref: "Poll" },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
    petitionId: { type: mongoose.Schema.Types.ObjectId, ref: "Petition" },
  },
  { timestamps: true },
);

// Create indexes for better performance
PostSchema.index({ locality: 1 });
PostSchema.index({ createdBy: 1 });
PostSchema.index({ type: 1, locality: 1 });
PostSchema.index({ locality: 1 });

export default mongoose.models.Post || mongoose.model<Post>("Post", PostSchema);
