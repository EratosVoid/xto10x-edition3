import mongoose from "mongoose";

import { Notification } from "@/types";
import User from "./User";

const NotificationSchema = new mongoose.Schema<Notification>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    message: { type: String, required: true },
    locality: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Create indexes for better performance
NotificationSchema.index({ userId: 1 });
NotificationSchema.index({ locality: 1 });
NotificationSchema.index({ isRead: 1, userId: 1 });

const NotificationModel =
  mongoose.models.Notification ||
  mongoose.model<Notification>("Notification", NotificationSchema);

export default NotificationModel;
