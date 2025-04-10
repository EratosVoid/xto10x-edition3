import mongoose from "mongoose";
import { Poll } from "@/types";

const PollSchema = new mongoose.Schema<Poll>(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    petitionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Petition",
    },
    options: {
      type: Map,
      of: Number,
      default: {},
    },
    votedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// Create indexes for better performance
PollSchema.index({ postId: 1 });
PollSchema.index({ petitionId: 1 });

export default mongoose.models.Poll || mongoose.model<Poll>("Poll", PollSchema);
