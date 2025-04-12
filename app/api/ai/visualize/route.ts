import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db/connect";
import PostModel from "@/models/Post";
import UserModel from "@/models/User";
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

    // Get community data to provide context
    const userStats = await UserModel.aggregate([
      { $match: { locality: post.locality } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          ageGroups: {
            $push: { $cond: [{ $ifNull: ["$age", false] }, "$age", "unknown"] },
          },
          genders: {
            $push: {
              $cond: [{ $ifNull: ["$gender", false] }, "$gender", "unknown"],
            },
          },
          occupations: {
            $push: {
              $cond: [
                { $ifNull: ["$occupation", false] },
                "$occupation",
                "unknown",
              ],
            },
          },
        },
      },
    ]);

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
I need you to analyze and visualize how a community post will impact different demographic groups in the community.

Post details:
Title: ${post.title}
Type: ${post.type}
Description: ${post.description}
${typeSpecificDetails}
Priority: ${post.priority}
Location: ${post.locality}
Created by: ${post.createdBy.name}

Based on this post information, I need you to:

1. Generate a visualization data structure (in JSON) showing the potential impact on various demographic groups in the community
2. Identify benefits and challenges this post presents to the community
3. Create a timeline of how this initiative might unfold
4. Provide actionable recommendations for maximizing positive community impact

Rather than generating a physical image, provide structured data that could be visualized by a frontend component. 
The output should be valid JSON that follows this structure:

{
  "demographics": [
    {"group": "Young Adults (18-25)", "impact": 85, "sentiment": "Very Positive"},
    {"group": "Families", "impact": 65, "sentiment": "Mostly Positive"},
    {"group": "Elderly", "impact": 35, "sentiment": "Mixed"},
    {"group": "Low Income", "impact": 45, "sentiment": "Mixed"}
  ],
  "benefits": [
    "Benefit 1",
    "Benefit 2",
    "Benefit 3"
  ],
  "challenges": [
    "Challenge 1",
    "Challenge 2",
    "Challenge 3"
  ],
  "timeline": [
    {"name": "Initial Phase", "timeframe": "1-2 weeks", "completed": true},
    {"name": "Growth Phase", "timeframe": "1-3 months", "completed": false},
    {"name": "Outcomes", "timeframe": "3-6 months", "completed": false}
  ],
  "recommendations": [
    "Recommendation 1",
    "Recommendation 2",
    "Recommendation 3"
  ]
}

IMPORTANT: 
- Only respond with raw, clean JSON (no markdown formatting, no \`\`\` backticks)
- The JSON must be valid and properly formatted
- Include at least 4 demographic groups in your analysis
- Give impact scores from 1-100
- Provide 3-5 benefits and challenges each
- Create a realistic timeline with 3-5 stages
- Offer 3-5 specific recommendations`;

    // Use gemini-1.5-flash model for generating structured data
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generate content with safety settings
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();

    // Parse the text response as JSON
    // Gemini typically returns just the JSON when instructed properly
    try {
      const visualizationData = JSON.parse(textResponse);
      return NextResponse.json({ visualization: visualizationData });
    } catch (error) {
      console.error("Error parsing AI response as JSON:", error);
      console.log("Raw AI response:", textResponse);

      // Attempt to extract JSON from the response if it's not pure JSON
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const extractedJson = JSON.parse(jsonMatch[0]);
          return NextResponse.json({ visualization: extractedJson });
        } catch (innerError) {
          console.error("Failed to extract valid JSON from response");
          throw new Error("Failed to generate visualization data");
        }
      } else {
        throw new Error("Failed to generate visualization data");
      }
    }
  } catch (error: any) {
    console.error("Error visualizing impact:", error);

    return NextResponse.json(
      { error: "Failed to generate visualization: " + error.message },
      { status: 500 }
    );
  }
}
