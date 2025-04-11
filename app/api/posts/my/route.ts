import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/db/connect";
import PostModel from "@/models/Post";

// GET /api/posts/my - Get user's posts
export async function GET(req: NextRequest) {
  try {
    // Verify user is authenticated
    const token = await getToken({ req });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get user's posts
    const posts = await PostModel.find({ createdBy: token.id })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name image");

    return NextResponse.json({ posts });
  } catch (error: any) {
    console.error("Error fetching user's posts:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
