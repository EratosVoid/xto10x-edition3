import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/db/connect";
import PollModel from "@/models/Poll";
import UserModel from "@/models/User";
import PostModel from "@/models/Post";
import mongoose from "mongoose";

// GET /api/polls/[id] - Get a specific poll
export async function GET(req: NextRequest, { params }: any) {
  try {
    const pollId = params.id;

    // Validate poll ID
    if (!mongoose.Types.ObjectId.isValid(pollId)) {
      return NextResponse.json({ error: "Invalid poll ID" }, { status: 400 });
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

    // Find poll by ID and populate related fields
    const poll = await PollModel.findById(pollId)
      .populate("postId")
      .populate("votedUsers", "name image");

    // Check if poll exists
    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    // Check if user has access (same locality as the post)
    if (poll.postId.locality !== user.locality) {
      return NextResponse.json(
        { error: "You don't have access to this poll" },
        { status: 403 }
      );
    }

    return NextResponse.json(poll);
  } catch (error: any) {
    console.error("Error fetching poll:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch poll" },
      { status: 500 }
    );
  }
}

// PUT /api/polls/[id] - Update a poll's options
export async function PUT(req: NextRequest, { params }: any) {
  try {
    const pollId = params.id;

    // Validate poll ID
    if (!mongoose.Types.ObjectId.isValid(pollId)) {
      return NextResponse.json({ error: "Invalid poll ID" }, { status: 400 });
    }

    // Check authentication
    const token = await getToken({ req });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Find the poll
    const poll = await PollModel.findById(pollId).populate("postId");
    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    // Check if user is the creator of the associated post
    if (poll.postId.createdBy.toString() !== token.id) {
      return NextResponse.json(
        { error: "You can only edit polls for your own posts" },
        { status: 403 }
      );
    }

    // Get update data
    const body = await req.json();
    const { options } = body;

    // Validate options
    if (!options || !Object.keys(options).length) {
      return NextResponse.json(
        { error: "Poll options are required" },
        { status: 400 }
      );
    }

    // Check if there are already votes
    const hasVotes = [...poll.options.values()].some((count) => count > 0);
    if (hasVotes) {
      return NextResponse.json(
        { error: "Cannot update poll options after voting has started" },
        { status: 400 }
      );
    }

    // Update poll options
    const updatedPoll = await PollModel.findByIdAndUpdate(
      pollId,
      { options },
      { new: true, runValidators: true }
    ).populate("votedUsers", "name image");

    return NextResponse.json(updatedPoll);
  } catch (error: any) {
    console.error("Error updating poll:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update poll" },
      { status: 500 }
    );
  }
}

// DELETE /api/polls/[id] - Delete a poll
export async function DELETE(req: NextRequest, { params }: any) {
  try {
    const pollId = params.id;

    // Validate poll ID
    if (!mongoose.Types.ObjectId.isValid(pollId)) {
      return NextResponse.json({ error: "Invalid poll ID" }, { status: 400 });
    }

    // Check authentication
    const token = await getToken({ req });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Find poll
    const poll = await PollModel.findById(pollId).populate("postId");
    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    // Check if user is the creator of the associated post or an admin/moderator
    const user = await UserModel.findById(token.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isAuthorized =
      poll.postId.createdBy.toString() === token.id ||
      user.role === "admin" ||
      user.role === "moderator";

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "You don't have permission to delete this poll" },
        { status: 403 }
      );
    }

    // Find the associated post
    const post = await PostModel.findById(poll.postId._id);
    if (post) {
      // Remove poll reference from post
      await PostModel.findByIdAndUpdate(post._id, { $unset: { pollId: 1 } });
    }

    // Delete poll
    await PollModel.findByIdAndDelete(pollId);

    return NextResponse.json({ message: "Poll deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting poll:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete poll" },
      { status: 500 }
    );
  }
}
