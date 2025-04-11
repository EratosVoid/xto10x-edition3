import mongoose from "mongoose";

import { Discussion } from "@/types";

const DiscussionSchema = new mongoose.Schema<Discussion>(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    content: { type: String, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discussion",
    },
  },
  { timestamps: true },
);

// Create indexes for better performance
DiscussionSchema.index({ postId: 1 });
DiscussionSchema.index({ createdBy: 1 });
DiscussionSchema.index({ parentId: 1 });

export default mongoose.models.Discussion ||
  mongoose.model<Discussion>("Discussion", DiscussionSchema);
