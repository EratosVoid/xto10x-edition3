import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/db/connect";
import EventModel from "@/models/Event";
import UserModel from "@/models/User";
import PostModel from "@/models/Post";
import mongoose from "mongoose";

// POST /api/events/[id]/attendance - Attend an event
export async function POST(req: NextRequest, { params }: any) {
  try {
    const eventId = params.id;

    // Validate event ID
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    // Check authentication
    const token = await getToken({ req });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get user
    const user = await UserModel.findById(token.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find event by ID
    const event = await EventModel.findById(eventId).populate("postId");
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if user has access (same locality as the post)
    if (event.postId.locality !== user.locality) {
      return NextResponse.json(
        { error: "You don't have access to this event" },
        { status: 403 }
      );
    }

    // Check if user is already attending
    if (event.attendees.includes(token.id as any)) {
      return NextResponse.json(
        { error: "You're already attending this event" },
        { status: 409 }
      );
    }

    // Add user to attendees
    const updatedEvent = await EventModel.findByIdAndUpdate(
      eventId,
      { $addToSet: { attendees: token.id } },
      { new: true, runValidators: true }
    )
      .populate("organizer", "name image")
      .populate("attendees", "name image");

    return NextResponse.json(updatedEvent);
  } catch (error: any) {
    console.error("Error attending event:", error);
    return NextResponse.json(
      { error: error.message || "Failed to attend event" },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id]/attendance - Leave an event
export async function DELETE(req: NextRequest, { params }: any) {
  try {
    const eventId = params.id;

    // Validate event ID
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    // Check authentication
    const token = await getToken({ req });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Find event by ID
    const event = await EventModel.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if user is attending
    if (!event.attendees.includes(token.id as any)) {
      return NextResponse.json(
        { error: "You're not attending this event" },
        { status: 400 }
      );
    }

    // Check if user is the organizer (organizer can't leave their own event)
    if (event.organizer.toString() === token.id) {
      return NextResponse.json(
        { error: "As the organizer, you cannot leave your own event" },
        { status: 400 }
      );
    }

    // Remove user from attendees
    const updatedEvent = await EventModel.findByIdAndUpdate(
      eventId,
      { $pull: { attendees: token.id } },
      { new: true, runValidators: true }
    )
      .populate("organizer", "name image")
      .populate("attendees", "name image");

    return NextResponse.json(updatedEvent);
  } catch (error: any) {
    console.error("Error leaving event:", error);
    return NextResponse.json(
      { error: error.message || "Failed to leave event" },
      { status: 500 }
    );
  }
}
