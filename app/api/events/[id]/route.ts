import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/db/connect";
import EventModel from "@/models/Event";
import UserModel from "@/models/User";
import PostModel from "@/models/Post";
import mongoose from "mongoose";

// GET /api/events/[id] - Get a specific event
export async function GET(req: NextRequest, { params }: any) {
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

    // Get user's locality
    const user = await UserModel.findById(token.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find event by ID and populate related fields
    const event = await EventModel.findById(eventId)
      .populate("organizer", "name image")
      .populate("attendees", "name image")
      .populate("postId");

    // Check if event exists
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

    return NextResponse.json(event);
  } catch (error: any) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch event" },
      { status: 500 }
    );
  }
}

// PUT /api/events/[id] - Update an event
export async function PUT(req: NextRequest, { params }: any) {
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

    // Find the event
    const event = await EventModel.findById(eventId).populate("postId");
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if user is the organizer of the event
    if (event.organizer.toString() !== token.id) {
      return NextResponse.json(
        { error: "You can only edit events you organized" },
        { status: 403 }
      );
    }

    // Get update data
    const body = await req.json();
    const { startDate, endDate, duration, location } = body;

    // Update event
    const updatedEvent = await EventModel.findByIdAndUpdate(
      eventId,
      {
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(duration && { duration }),
        ...(location && { location }),
      },
      { new: true, runValidators: true }
    )
      .populate("organizer", "name image")
      .populate("attendees", "name image");

    return NextResponse.json(updatedEvent);
  } catch (error: any) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update event" },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id] - Delete an event
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

    // Find event
    const event = await EventModel.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if user is the organizer of the event or an admin/moderator
    const user = await UserModel.findById(token.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isAuthorized =
      event.organizer.toString() === token.id ||
      user.role === "admin" ||
      user.role === "moderator";

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "You don't have permission to delete this event" },
        { status: 403 }
      );
    }

    // Find the associated post
    const post = await PostModel.findOne({ eventId });
    if (post) {
      // Remove event reference from post
      await PostModel.findByIdAndUpdate(post._id, { $unset: { eventId: 1 } });
    }

    // Delete event
    await EventModel.findByIdAndDelete(eventId);

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete event" },
      { status: 500 }
    );
  }
}
