import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { z } from "zod";

import connectDB from "@/lib/db/connect";
import PostModel from "@/models/Post";
import { summarizeText } from "@/lib/ai";

// Define validation schema
const postSchema = z.object({
  type: z.enum(["general", "event", "poll", "petition"]),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  locality: z.string().min(1, "Locality is required"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  category: z.string().min(1, "Category is required"),
});

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const locality = searchParams.get("locality");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = parseInt(searchParams.get("skip") || "0");
    const type = searchParams.get("type");
    const category = searchParams.get("category");

    // Build query
    const query: any = {};

    if (locality) {
      query.locality = locality;
    }

    if (type) {
      query.type = type;
    }

    if (category) {
      query.category = category;
    }

    const posts = await PostModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name image");

    const total = await PostModel.countDocuments(query);

    return NextResponse.json({
      posts,
      pagination: {
        total,
        skip,
        limit,
        hasMore: skip + limit < total,
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

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const token = await getToken({ req });

    if (!token || !token.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Validate request body
    const result = postSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors }, { status: 400 });
    }

    const postData = result.data;

    // Generate summary with AI
    const summarizedDescription = await summarizeText(postData.description);

    // Create post
    const post = await PostModel.create({
      ...postData,
      summarizedDescription,
      createdBy: token.id,
    });

    // Populate the createdBy field for the response
    await post.populate("createdBy", "name image");

    return NextResponse.json(
      { message: "Post created successfully", post },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating post:", error);

    return NextResponse.json(
      { error: error.message || "Failed to create post" },
      { status: 500 },
    );
  }
}
