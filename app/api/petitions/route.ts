import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import mongoose from "mongoose";

import connectDB from "@/lib/db/connect";
import PetitionModel from "@/models/Petition";
import PollModel from "@/models/Poll";
import UserModel from "@/models/User";
import PostModel from "@/models/Post";

// GET /api/petitions - Get all petitions (with optional filtering)
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

    // Find all petitions
    const petitions = await PetitionModel.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("postId")
      .populate("pollId");

    // Filter petitions by user's locality
    const accessiblePetitions = [];

    for (const petition of petitions) {
      if (petition.postId && petition.postId.locality === user.locality) {
        accessiblePetitions.push(petition);
      }
    }

    // Count total petitions for pagination
    const totalPetitions = await PetitionModel.countDocuments();

    return NextResponse.json({
      petitions: accessiblePetitions,
      pagination: {
        total: totalPetitions,
        page,
        limit,
        pages: Math.ceil(totalPetitions / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching petitions:", error);

    return NextResponse.json(
      { error: error.message || "Failed to fetch petitions" },
      { status: 500 },
    );
  }
}

// POST /api/petitions - Create a new petition (linked to a post)
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

    // Get petition data
    const body = await req.json();
    const { postId, target, goal } = body;

    // Validate required fields
    if (!postId || !target || !goal) {
      return NextResponse.json(
        { error: "Missing required petition details" },
        { status: 400 },
      );
    }

    // Validate postId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    // Check if post exists and is of type 'petition'
    const post = await PostModel.findById(postId);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.type !== "petition") {
      return NextResponse.json(
        { error: "Post is not of type 'petition'" },
        { status: 400 },
      );
    }

    // Check if user is the creator of the post
    if (post.createdBy.toString() !== token.id) {
      return NextResponse.json(
        { error: "You can only create petitions for your own posts" },
        { status: 403 },
      );
    }

    // Check if a petition already exists for this post
    const existingPetition = await PetitionModel.findOne({ postId });

    if (existingPetition) {
      return NextResponse.json(
        { error: "A petition already exists for this post" },
        { status: 409 },
      );
    }

    // Create a companion poll for signatures (Yes/No options)
    const pollOptions = new Map();

    pollOptions.set("Yes", 0);
    pollOptions.set("No", 0);

    const newPoll = new PollModel({
      postId,
      options: pollOptions,
      votedUsers: [],
    });

    await newPoll.save();

    // Create new petition
    const newPetition = new PetitionModel({
      postId,
      pollId: newPoll._id,
      target,
      goal,
    });

    await newPetition.save();

    // Update post with petition ID
    await PostModel.findByIdAndUpdate(postId, {
      petitionId: newPetition._id,
      pollId: newPoll._id,
    });

    // Update poll with petition ID
    await PollModel.findByIdAndUpdate(newPoll._id, {
      petitionId: newPetition._id,
    });

    // Return populated petition
    const populatedPetition = await PetitionModel.findById(newPetition._id)
      .populate("postId")
      .populate("pollId");

    return NextResponse.json(populatedPetition, { status: 201 });
  } catch (error: any) {
    console.error("Error creating petition:", error);

    return NextResponse.json(
      { error: error.message || "Failed to create petition" },
      { status: 500 },
    );
  }
}
