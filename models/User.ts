import mongoose from "mongoose";
import { User } from "@/types";

const UserSchema = new mongoose.Schema<User>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "moderator", "admin"],
      default: "user",
    },
    locality: { type: String, required: true, index: true },
    points: { type: Number, default: 0 },
    eventsHosted: { type: Number, default: 0 },
    pollsVoted: { type: Number, default: 0 },
    discussionsStarted: { type: Number, default: 0 },
    petitionsCreated: { type: Number, default: 0 },
    notifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notification",
      },
    ],
  },
  { timestamps: true }
);

// Create indexes for better performance
UserSchema.index({ locality: 1 });
UserSchema.index({ email: 1 }, { unique: true });

export default mongoose.models.User || mongoose.model<User>("User", UserSchema);
