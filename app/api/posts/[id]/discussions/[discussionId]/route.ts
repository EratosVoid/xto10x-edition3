import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/db/connect";
import UserModel from "@/models/User";
import DiscussionModel from "@/models/Discussion";
import mongoose from "mongoose";

// DELETE /api/posts/[id]/discussions/[discussionId] - Delete a specific discussion
export async function DELETE(req: NextRequest, { params }: any) {
  try {
    const { id: postId, discussionId } = params;

    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(postId) ||
      !mongoose.Types.ObjectId.isValid(discussionId)
    ) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
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

    // Find the discussion
    const discussion = await DiscussionModel.findById(discussionId);
    if (!discussion) {
      return NextResponse.json(
        { error: "Discussion not found" },
        { status: 404 }
      );
    }

    // Check if discussion belongs to the specified post
    if (discussion.postId.toString() !== postId) {
      return NextResponse.json(
        { error: "Discussion doesn't belong to this post" },
        { status: 400 }
      );
    }

    // Check if user is authorized to delete (owner of the discussion or admin/moderator)
    const isAuthorized =
      discussion.createdBy.toString() === token.id ||
      user.role === "admin" ||
      user.role === "moderator";

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "You don't have permission to delete this discussion" },
        { status: 403 }
      );
    }

    // Check if there are replies to this discussion
    const hasReplies = await DiscussionModel.exists({ parentId: discussionId });

    if (hasReplies) {
      // If there are replies, just update the content to indicate it was deleted
      await DiscussionModel.findByIdAndUpdate(discussionId, {
        content: "[This comment has been deleted]",
        isDeleted: true,
      });
    } else {
      // If no replies, delete the discussion
      await DiscussionModel.findByIdAndDelete(discussionId);
    }

    return NextResponse.json({ message: "Discussion deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting discussion:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete discussion" },
      { status: 500 }
    );
  }
}

// PUT /api/posts/[id]/discussions/[discussionId] - Update a discussion
export async function PUT(req: NextRequest, { params }: any) {
  try {
    const { id: postId, discussionId } = params;

    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(postId) ||
      !mongoose.Types.ObjectId.isValid(discussionId)
    ) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    // Check authentication
    const token = await getToken({ req });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Find the discussion
    const discussion = await DiscussionModel.findById(discussionId);
    if (!discussion) {
      return NextResponse.json(
        { error: "Discussion not found" },
        { status: 404 }
      );
    }

    // Check if discussion belongs to the specified post
    if (discussion.postId.toString() !== postId) {
      return NextResponse.json(
        { error: "Discussion doesn't belong to this post" },
        { status: 400 }
      );
    }

    // Check if user is the creator of the discussion
    if (discussion.createdBy.toString() !== token.id) {
      return NextResponse.json(
        { error: "You can only edit your own discussions" },
        { status: 403 }
      );
    }

    // Get update data
    const body = await req.json();
    const { content } = body;

    // Validate content
    if (!content || content.trim() === "") {
      return NextResponse.json(
        { error: "Discussion content is required" },
        { status: 400 }
      );
    }

    // Update discussion
    const updatedDiscussion = await DiscussionModel.findByIdAndUpdate(
      discussionId,
      { content },
      { new: true, runValidators: true }
    ).populate("createdBy", "name image");

    return NextResponse.json(updatedDiscussion);
  } catch (error: any) {
    console.error("Error updating discussion:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update discussion" },
      { status: 500 }
    );
  }
}
