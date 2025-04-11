import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/db/connect";
import PollModel from "@/models/Poll";
import UserModel from "@/models/User";
import PostModel from "@/models/Post";
import mongoose from "mongoose";

// GET /api/polls - Get all polls (with optional filtering)
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
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const page = parseInt(url.searchParams.get("page") || "1");

    // Find all polls
    const polls = await PollModel.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("postId")
      .populate("votedUsers", "name image");

    // Filter polls by user's locality
    const accessiblePolls = [];
    for (const poll of polls) {
      if (poll.postId && poll.postId.locality === user.locality) {
        accessiblePolls.push(poll);
      }
    }

    // Count total polls for pagination
    const totalPolls = await PollModel.countDocuments();

    return NextResponse.json({
      polls: accessiblePolls,
      pagination: {
        total: totalPolls,
        page,
        limit,
        pages: Math.ceil(totalPolls / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching polls:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch polls" },
      { status: 500 }
    );
  }
}

// POST /api/polls - Create a new poll (linked to a post)
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

    // Get poll data
    const body = await req.json();
    const { postId, options } = body;

    // Validate required fields
    if (!postId || !options || !Object.keys(options).length) {
      return NextResponse.json(
        { error: "Missing required poll details" },
        { status: 400 }
      );
    }

    // Validate postId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    // Check if post exists and is of type 'poll'
    const post = await PostModel.findById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.type !== "poll") {
      return NextResponse.json(
        { error: "Post is not of type 'poll'" },
        { status: 400 }
      );
    }

    // Check if user is the creator of the post
    if (post.createdBy.toString() !== token.id) {
      return NextResponse.json(
        { error: "You can only create polls for your own posts" },
        { status: 403 }
      );
    }

    // Check if a poll already exists for this post
    const existingPoll = await PollModel.findOne({ postId });
    if (existingPoll) {
      return NextResponse.json(
        { error: "A poll already exists for this post" },
        { status: 409 }
      );
    }

    // Initialize options with 0 votes
    const pollOptions: any = {};
    Object.keys(options).forEach((option) => {
      pollOptions[option] = 0;
    });

    // Create new poll
    const newPoll = new PollModel({
      postId,
      options: pollOptions,
      votedUsers: [], // Initially empty
    });

    await newPoll.save();

    // Update post with poll ID
    await PostModel.findByIdAndUpdate(postId, { pollId: newPoll._id });

    return NextResponse.json(newPoll, { status: 201 });
  } catch (error: any) {
    console.error("Error creating poll:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create poll" },
      { status: 500 }
    );
  }
}
