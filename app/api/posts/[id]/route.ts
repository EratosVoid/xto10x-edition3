import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/db/connect";
import PostModel from "@/models/Post";
import UserModel from "@/models/User";
import mongoose from "mongoose";

// GET /api/posts/[id] - Get a specific post, checking locality
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Find post by ID and populate creator info
    const post = await PostModel.findById(postId).populate(
      "createdBy",
      "name image"
    );

    // Check if post exists
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if user has access (same locality)
    if (post.locality !== user.locality) {
      return NextResponse.json(
        { error: "You don't have access to this post" },
        { status: 403 }
      );
    }

    return NextResponse.json(post);
  } catch (error: any) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch post" },
      { status: 500 }
    );
  }
}

// PUT /api/posts/[id] - Update a post
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Find the post
    const post = await PostModel.findById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if user is the creator of the post
    if (post.createdBy.toString() !== token.id) {
      return NextResponse.json(
        { error: "You can only edit your own posts" },
        { status: 403 }
      );
    }

    // Get update data
    const body = await req.json();
    const { title, description, category, priority } = body;

    // Update post
    const updatedPost = await PostModel.findByIdAndUpdate(
      postId,
      {
        ...(title && { title }),
        ...(description && { description }),
        ...(category && { category }),
        ...(priority && { priority }),
      },
      { new: true, runValidators: true }
    ).populate("createdBy", "name image");

    return NextResponse.json(updatedPost);
  } catch (error: any) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update post" },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id] - Delete a post
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Find post
    const post = await PostModel.findById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if user is the creator of the post or an admin/moderator
    const user = await UserModel.findById(token.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isAuthorized =
      post.createdBy.toString() === token.id ||
      user.role === "admin" ||
      user.role === "moderator";

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "You don't have permission to delete this post" },
        { status: 403 }
      );
    }

    // Delete post
    await PostModel.findByIdAndDelete(postId);

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete post" },
      { status: 500 }
    );
  }
}
