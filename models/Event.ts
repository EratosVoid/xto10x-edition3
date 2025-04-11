import mongoose from "mongoose";
import { Event } from "@/types";

const EventSchema = new mongoose.Schema<Event>(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    duration: { type: Number, required: true }, // in minutes
    location: { type: String, required: true },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// Create indexes for better performance
EventSchema.index({ postId: 1 });
EventSchema.index({ organizer: 1 });

export default mongoose.models.Event ||
  mongoose.model<Event>("Event", EventSchema);
