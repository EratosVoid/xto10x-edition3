import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import connectDB from "@/lib/db/connect";
import PostModel from "@/models/Post";
import UserModel from "@/models/User";

// GET /api/posts - Get locality-filtered posts
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const self = url.searchParams.get("self");
    const type = url.searchParams.get("type");
    const search = url.searchParams.get("search");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const page = parseInt(url.searchParams.get("page") || "1");

    // Verify user is authenticated and get their locality
    const token = await getToken({ req });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get user's locality from database
    const user = await UserModel.findById(token.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userLocality = user.locality;

    // Build query
    const query: any = { locality: userLocality };

    if (self) {
      query.createdBy = token.id;
    }

    if (type) {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Get total count
    const total = await PostModel.countDocuments(query);

    // Get posts with pagination
    const posts = await PostModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("createdBy", "name image");

    return NextResponse.json({
      posts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching posts:", error);

    return NextResponse.json(
      { error: error.message || "Failed to fetch posts" },
      { status: 500 },
    );
  }
}

// POST /api/posts - Create a new post
export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { title, description, type, priority = "medium" } = body;

    // Validate required fields
    if (!title || !description || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Get user's locality
    const user = await UserModel.findById(token.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create new post with the user's locality
    const post = await PostModel.create({
      title,
      description,
      type,
      priority,
      locality: user.locality,
      createdBy: token.id,
    });

    // Populate the creator info
    const populatedPost = await PostModel.findById(post._id).populate(
      "createdBy",
      "name image",
    );

    return NextResponse.json(populatedPost, { status: 201 });
  } catch (error: any) {
    console.error("Error creating post:", error);

    return NextResponse.json(
      { error: error.message || "Failed to create post" },
      { status: 500 },
    );
  }
}
