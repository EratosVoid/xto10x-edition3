import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db/connect";
import PostModel from "@/models/Post";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API
const API_KEY =
  process.env.GEMINI_API_KEY || "AIzaSyCjBAPDM5-55Vg8TvvUsVkk-ZkdVFepkn0";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function POST(request: Request) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // Parse request
    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find the post
    const post = await PostModel.findById(postId)
      .populate("createdBy", "name")
      .populate("pollId")
      .populate("eventId")
      .populate("petitionId");

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Get details based on post type
    let typeSpecificDetails = "";

    if (post.type === "event" && post.eventId) {
      const startDate = new Date(post.eventId.startDate).toLocaleDateString();
      const location = post.eventId.location;
      typeSpecificDetails = `This is an event scheduled for ${startDate} at ${location}.`;
    } else if (post.type === "poll" && post.pollId) {
      const options = Object.keys(post.pollId.options).join(", ");
      typeSpecificDetails = `This is a poll with the following options: ${options}.`;
    } else if (post.type === "petition" && post.petitionId) {
      typeSpecificDetails = `This is a petition targeted at ${post.petitionId.target} with a goal of ${post.petitionId.goal} signatures.`;
    }

    // Create a prompt for the AI
    const prompt = `You are an AI assistant for a community engagement platform called LocalVoice.
Your task is to summarize community posts in a concise, informative way.

Please provide a concise summary (3-5 sentences) of the following community post:

Title: ${post.title}
Type: ${post.type}
Description: ${post.description}
${typeSpecificDetails}
Priority: ${post.priority}
Location: ${post.locality}
Created by: ${post.createdBy.name}

Your summary should:
- Highlight the key points, purpose, and any important details
- Be informative and useful for community members
- Capture the essence of the post in an engaging way
- Maintain a helpful, community-oriented tone
- Be approximately 2-4 sentences in length`;

    // Use gemini-1.5-flash model for fast, concise summarization
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generate content with safety settings
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error("Error summarizing post:", error);

    return NextResponse.json(
      { error: "Failed to generate summary: " + error.message },
      { status: 500 }
    );
  }
}
