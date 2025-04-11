import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import mongoose from "mongoose";

import connectDB from "@/lib/db/connect";
import PostModel from "@/models/Post";
import UserModel from "@/models/User";
import DiscussionModel from "@/models/Discussion";

// GET /api/posts/[id]/discussions - Get all discussions for a post
export async function GET(req: NextRequest, { params }: any) {
  try {
    const postId = params.id;

    // Validate post ID
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
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

    // Find post by ID to check locality
    const post = await PostModel.findById(postId);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if user has access (same locality)
    if (post.locality !== user.locality) {
      return NextResponse.json(
        { error: "You don't have access to this post's discussions" },
        { status: 403 },
      );
    }

    // Fetch all discussions for this post
    const discussions = await DiscussionModel.find({ postId })
      .populate("createdBy", "name image")
      .populate({
        path: "parentId",
        populate: {
          path: "createdBy",
          select: "name image",
        },
      })
      .sort({ createdAt: -1 });

    return NextResponse.json(discussions);
  } catch (error: any) {
    console.error("Error fetching discussions:", error);

    return NextResponse.json(
      { error: error.message || "Failed to fetch discussions" },
      { status: 500 },
    );
  }
}

// POST /api/posts/[id]/discussions - Create a new discussion
export async function POST(req: NextRequest, { params }: any) {
  try {
    const postId = params.id;

    // Validate post ID
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
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

    // Find post by ID to check locality
    const post = await PostModel.findById(postId);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if user has access (same locality)
    if (post.locality !== user.locality) {
      return NextResponse.json(
        { error: "You don't have access to this post's discussions" },
        { status: 403 },
      );
    }

    // Get discussion data
    const body = await req.json();
    const { content, parentId } = body;

    // Validate content
    if (!content || content.trim() === "") {
      return NextResponse.json(
        { error: "Discussion content is required" },
        { status: 400 },
      );
    }

    // Validate parentId if provided
    if (parentId && !mongoose.Types.ObjectId.isValid(parentId)) {
      return NextResponse.json(
        { error: "Invalid parent discussion ID" },
        { status: 400 },
      );
    }

    // If parentId is provided, check if it exists
    if (parentId) {
      const parentDiscussion = await DiscussionModel.findById(parentId);

      if (!parentDiscussion) {
        return NextResponse.json(
          { error: "Parent discussion not found" },
          { status: 404 },
        );
      }

      // Check if parent discussion belongs to the same post
      if (parentDiscussion.postId.toString() !== postId) {
        return NextResponse.json(
          { error: "Parent discussion doesn't belong to this post" },
          { status: 400 },
        );
      }
    }

    // Create discussion
    const newDiscussion = new DiscussionModel({
      postId,
      content,
      createdBy: token.id,
      ...(parentId && { parentId }),
    });

    await newDiscussion.save();

    // Return populated discussion
    const populatedDiscussion = await DiscussionModel.findById(
      newDiscussion._id,
    )
      .populate("createdBy", "name image")
      .populate({
        path: "parentId",
        populate: {
          path: "createdBy",
          select: "name image",
        },
      });

    return NextResponse.json(populatedDiscussion, { status: 201 });
  } catch (error: any) {
    console.error("Error creating discussion:", error);

    return NextResponse.json(
      { error: error.message || "Failed to create discussion" },
      { status: 500 },
    );
  }
}
