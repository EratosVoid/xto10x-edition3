import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import connectDB from "@/lib/db/connect";
import UserModel from "@/models/User";
import PostModel from "@/models/Post";
import DiscussionModel from "@/models/Discussion";
import EventModel from "@/models/Event";

// GET /api/user/stats - Get statistics for the current user
export async function GET(req: NextRequest) {
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

    // Count user's posts (all types)
    const postsCount = await PostModel.countDocuments({
      createdBy: token.id,
    });

    // Count discussions (comments) created by the user
    const discussionsCount = await DiscussionModel.countDocuments({
      createdBy: token.id,
    });

    // Count events the user is attending
    const eventsCount = await EventModel.countDocuments({
      attendees: token.id,
    });

    // Count events the user is organizing
    const eventsOrganizedCount = await EventModel.countDocuments({
      organizer: token.id,
    });

    // Calculate points based on user activity (using multipliers)
    const postPoints = postsCount * 10; // 10 points per post
    const discussionPoints = discussionsCount * 5; // 5 points per discussion
    const eventPoints = eventsCount * 8; // 8 points per event attended
    const organizerPoints = eventsOrganizedCount * 15; // 15 points per event organized

    // Calculate total points
    const calculatedPoints =
      postPoints + discussionPoints + eventPoints + organizerPoints;

    // Return all stats
    return NextResponse.json({
      posts: postsCount,
      discussions: discussionsCount,
      events: eventsCount,
      eventsOrganized: eventsOrganizedCount,
      points: calculatedPoints,
      // Additional stats from user model
      eventsHosted: user.eventsHosted || 0,
      pollsVoted: user.pollsVoted || 0,
      discussionsStarted: user.discussionsStarted || 0,
      petitionsCreated: user.petitionsCreated || 0,
    });
  } catch (error: any) {
    console.error("Error fetching user stats:", error);

    return NextResponse.json(
      { error: error.message || "Failed to fetch user statistics" },
      { status: 500 }
    );
  }
}
