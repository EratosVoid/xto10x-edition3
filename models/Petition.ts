import mongoose from "mongoose";

import { Petition } from "@/types";

const PetitionSchema = new mongoose.Schema<Petition>(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    target: { type: String, required: true },
    goal: { type: Number, required: true },
    signatures: { type: Number, default: 0 },
    supporters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// Create indexes for better performance
PetitionSchema.index({ postId: 1 });
PetitionSchema.index({ supporters: 1 });

export default mongoose.models.Petition ||
  mongoose.model<Petition>("Petition", PetitionSchema);
