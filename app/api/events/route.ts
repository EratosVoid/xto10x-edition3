import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import mongoose from "mongoose";

import connectDB from "@/lib/db/connect";
import EventModel from "@/models/Event";
import UserModel from "@/models/User";
import PostModel from "@/models/Post";

// GET /api/events - Get all events (with optional filtering)
export async function GET(req: NextRequest) {
  try {
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

    const url = new URL(req.url);
    const organizerId = url.searchParams.get("organizer");
    const upcoming = url.searchParams.get("upcoming");
    const past = url.searchParams.get("past");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const page = parseInt(url.searchParams.get("page") || "1");

    // Create base query
    let query: any = {};

    // Add organizer filter if provided
    if (organizerId && mongoose.Types.ObjectId.isValid(organizerId)) {
      query.organizer = organizerId;
    }

    // Add date filters
    const now = new Date();

    if (upcoming === "true") {
      query.startDate = { $gte: now };
    } else if (past === "true") {
      query.endDate = { $lt: now };
    }

    // Find all events matching the query
    const events = await EventModel.find(query)
      .sort({ startDate: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("organizer", "name image")
      .populate("postId");

    // For each event, check if the post is in the user's locality
    const accessibleEvents = [];

    for (const event of events) {
      if (event.postId && event.postId.locality === user.locality) {
        accessibleEvents.push(event);
      }
    }

    // Count total events for pagination
    const totalEvents = await EventModel.countDocuments(query);

    return NextResponse.json({
      events: accessibleEvents,
      pagination: {
        total: totalEvents,
        page,
        limit,
        pages: Math.ceil(totalEvents / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching events:", error);

    return NextResponse.json(
      { error: error.message || "Failed to fetch events" },
      { status: 500 },
    );
  }
}

// POST /api/events - Create a new event (linked to a post)
export async function POST(req: NextRequest) {
  try {
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

    // Get event data
    const body = await req.json();
    const { postId, startDate, endDate, duration, location } = body;

    // Validate required fields
    if (!postId || !startDate || !endDate || !duration || !location) {
      return NextResponse.json(
        { error: "Missing required event details" },
        { status: 400 },
      );
    }

    // Validate postId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    // Check if post exists and is of type 'event'
    const post = await PostModel.findById(postId);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.type !== "event") {
      return NextResponse.json(
        { error: "Post is not of type 'event'" },
        { status: 400 },
      );
    }

    // Check if user is the creator of the post
    if (post.createdBy.toString() !== token.id) {
      return NextResponse.json(
        { error: "You can only create events for your own posts" },
        { status: 403 },
      );
    }

    // Check if an event already exists for this post
    const existingEvent = await EventModel.findOne({ postId });

    if (existingEvent) {
      return NextResponse.json(
        { error: "An event already exists for this post" },
        { status: 409 },
      );
    }

    // Create new event
    const newEvent = new EventModel({
      postId,
      startDate,
      endDate,
      duration,
      location,
      organizer: token.id,
      attendees: [token.id], // Creator is automatically an attendee
    });

    await newEvent.save();

    // Update post with event ID
    await PostModel.findByIdAndUpdate(postId, { eventId: newEvent._id });

    // Return populated event
    const populatedEvent = await EventModel.findById(newEvent._id)
      .populate("organizer", "name image")
      .populate("attendees", "name image");

    return NextResponse.json(populatedEvent, { status: 201 });
  } catch (error: any) {
    console.error("Error creating event:", error);

    return NextResponse.json(
      { error: error.message || "Failed to create event" },
      { status: 500 },
    );
  }
};