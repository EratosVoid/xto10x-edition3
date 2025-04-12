import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/db/connect";
import mongoose from "mongoose";
import { GoogleGenerativeAI } from "@google/generative-ai";
import UserModel from "@/models/User";
import PostModel from "@/models/Post";
import EventModel from "@/models/Event";
import PetitionModel from "@/models/Petition";
import PollModel from "@/models/Poll";
import DiscussionModel from "@/models/Discussion";

// Initialize the Gemini API
const API_KEY =
  process.env.GEMINI_API_KEY || "AIzaSyCjBAPDM5-55Vg8TvvUsVkk-ZkdVFepkn0";
const genAI = new GoogleGenerativeAI(API_KEY);

// Import RAG context file
import ragContext from "@/lib/RAGContext.md.json";

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const token = await getToken({ req });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const { question } = body;

    if (!question || question.trim() === "") {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Get user information to determine locality
    const user = await UserModel.findById(token.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const locality = user.locality;

    // Fetch data from various models for context
    // This will be specific to the user's locality

    // Get recent posts in the locality
    const recentPosts = await PostModel.find({ locality })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title description type priority");

    // Get upcoming events in the locality
    const upcomingEvents = await EventModel.find({
      postId: {
        $in: await PostModel.find({ locality, type: "event" }).distinct("_id"),
      },
    })
      .sort({ startDate: 1 })
      .limit(5)
      .select("startDate endDate duration location");

    // Get active petitions in the locality
    const activePetitions = await PetitionModel.find({
      postId: {
        $in: await PostModel.find({ locality, type: "petition" }).distinct(
          "_id"
        ),
      },
    })
      .limit(5)
      .select("target goal");

    // Get recent polls in the locality
    const recentPolls = await PollModel.find({
      postId: {
        $in: await PostModel.find({ locality, type: "poll" }).distinct("_id"),
      },
    })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent discussions
    const recentDiscussions = await DiscussionModel.find({
      postId: { $in: await PostModel.find({ locality }).distinct("_id") },
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("content");

    // Build context for the AI model
    const contextData = {
      locality,
      recentPosts: recentPosts.map((post) => ({
        title: post.title,
        description: post.description,
        type: post.type,
        priority: post.priority,
      })),
      upcomingEvents: upcomingEvents.map((event) => ({
        startDate: event.startDate,
        endDate: event.endDate,
        duration: event.duration,
        location: event.location,
      })),
      activePetitions: activePetitions.map((petition) => ({
        target: petition.target,
        goal: petition.goal,
      })),
      recentPolls: recentPolls.map((poll) => ({
        options: poll.options,
      })),
      recentDiscussions: recentDiscussions.map((discussion) => ({
        content: discussion.content,
      })),
    };

    // Format context
    let contextString = generateContextString(contextData);

    const ragContextString = ragContext.content
      .map((section) => `${section.heading}: ${section.text}`)
      .join("\n");

    contextString += "\n" + ragContextString;

    // Use Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an AI assistant for a community engagement platform called LocalVoice. 
  Users can create and participate in events, polls, petitions, and discussions with others in their locality.
  
  The user asking this question is from the locality of ${locality}.
  
  Here is contextual data about the community for reference:
  ${contextString}
  
  Answer the following question clearly and concisely, providing specific information relevant to community engagement:
  
  ${question}
  
  When answering:
  - Focus on practical advice about community engagement
  - If the question is about events, petitions, polls, or discussions, provide specific information from the context when relevant
  - Mention specific events, posts, petitions, or discussions from the context when they directly relate to the question
  - Don't overwhelm with unnecessary details from the context
  - Keep your tone helpful and encouraging`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ answer: text });
  } catch (error: any) {
    console.error("Error generating AI response:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate response" },
      { status: 500 }
    );
  }
}

// Helper function to generate a formatted context string
function generateContextString(contextData: any): string {
  let contextString = "";

  // Add recent posts
  if (contextData.recentPosts && contextData.recentPosts.length > 0) {
    contextString += "Recent Community Posts:\n";
    contextData.recentPosts.forEach((post: any, index: number) => {
      contextString += `${index + 1}. ${post.title} (${post.type}, Priority: ${post.priority})\n`;
      contextString += `   Description: ${post.description.substring(0, 100)}${post.description.length > 100 ? "..." : ""}\n`;
    });
    contextString += "\n";
  }

  // Add upcoming events
  if (contextData.upcomingEvents && contextData.upcomingEvents.length > 0) {
    contextString += "Upcoming Events:\n";
    contextData.upcomingEvents.forEach((event: any, index: number) => {
      const startDate = new Date(event.startDate).toLocaleDateString();
      const location = event.location || "Location TBD";
      contextString += `${index + 1}. Event on ${startDate} at ${location}\n`;
      contextString += `   Duration: ${event.duration} minutes\n`;
    });
    contextString += "\n";
  }

  // Add active petitions
  if (contextData.activePetitions && contextData.activePetitions.length > 0) {
    contextString += "Active Petitions:\n";
    contextData.activePetitions.forEach((petition: any, index: number) => {
      contextString += `${index + 1}. Petition targeting "${petition.target}"\n`;
      contextString += `   Goal: ${petition.goal} signatures\n`;
    });
    contextString += "\n";
  }

  // Add recent polls
  if (contextData.recentPolls && contextData.recentPolls.length > 0) {
    contextString += "Recent Polls:\n";
    contextData.recentPolls.forEach((poll: any, index: number) => {
      contextString += `${index + 1}. Poll options: ${Object.keys(poll.options).join(", ")}\n`;
    });
    contextString += "\n";
  }

  // Add recent discussions (more summarized due to potential volume)
  if (
    contextData.recentDiscussions &&
    contextData.recentDiscussions.length > 0
  ) {
    contextString += "Recent Discussion Topics:\n";
    contextData.recentDiscussions.forEach((discussion: any, index: number) => {
      // Limit each discussion to first 50 characters
      const snippet = discussion.content.substring(0, 50);
      contextString += `${index + 1}. "${snippet}${discussion.content.length > 50 ? "..." : ""}"\n`;
    });
  }

  return contextString;
}
