import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import mongoose from "mongoose";

import connectDB from "@/lib/db/connect";
import PollModel from "@/models/Poll";
import UserModel from "@/models/User";

// POST /api/polls/[id]/vote - Vote in a poll
export async function POST(req: NextRequest, { params }: any) {
  try {
    const pollId = params.id;

    // Validate poll ID
    if (!mongoose.Types.ObjectId.isValid(pollId)) {
      return NextResponse.json({ error: "Invalid poll ID" }, { status: 400 });
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

    // Find poll by ID and populate related fields
    const poll = await PollModel.findById(pollId).populate("postId");

    // Check if poll exists
    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    // Check if user has access (same locality as the post)
    if (poll.postId.locality !== user.locality) {
      return NextResponse.json(
        { error: "You don't have access to this poll" },
        { status: 403 },
      );
    }

    // Check if user has already voted
    if (poll.votedUsers.includes(token.id as any)) {
      return NextResponse.json(
        { error: "You have already voted in this poll" },
        { status: 409 },
      );
    }

    // Get option from request
    const body = await req.json();
    const { option } = body;

    // Validate option
    if (!option) {
      return NextResponse.json(
        { error: "You must specify an option to vote for" },
        { status: 400 },
      );
    }

    // Check if option exists in poll
    if (!poll.options.has(option)) {
      return NextResponse.json(
        { error: "The selected option doesn't exist" },
        { status: 400 },
      );
    }

    // Update poll: increment option count and add user to votedUsers
    const optionKey = option;
    const currentCount = poll.options.get(optionKey) || 0;

    const updateObj: any = {
      $addToSet: { votedUsers: token.id },
    };

    // Need to use a special syntax for updating a Map field in MongoDB
    updateObj[`options.${optionKey}`] = currentCount + 1;

    const updatedPoll = await PollModel.findByIdAndUpdate(pollId, updateObj, {
      new: true,
      runValidators: true,
    })
      .populate("postId")
      .populate("votedUsers", "name image");

    return NextResponse.json(updatedPoll);
  } catch (error: any) {
    console.error("Error voting in poll:", error);

    return NextResponse.json(
      { error: error.message || "Failed to submit vote" },
      { status: 500 },
    );
  }
}

// DELETE /api/polls/[id]/vote - Remove your vote from a poll
export async function DELETE(req: NextRequest, { params }: any) {
  try {
    const pollId = params.id;

    // Validate poll ID
    if (!mongoose.Types.ObjectId.isValid(pollId)) {
      return NextResponse.json({ error: "Invalid poll ID" }, { status: 400 });
    }

    // Check authentication
    const token = await getToken({ req });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Find poll by ID
    const poll = await PollModel.findById(pollId).populate("postId");

    // Check if poll exists
    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    // Check if user has voted
    if (!poll.votedUsers.includes(token.id as any)) {
      return NextResponse.json(
        { error: "You haven't voted in this poll" },
        { status: 400 },
      );
    }

    // Get the user's previous vote (we need to find which option they voted for)
    const url = new URL(req.url);
    const votedOption = url.searchParams.get("option");

    if (!votedOption || !poll.options.has(votedOption)) {
      return NextResponse.json(
        { error: "You must specify which option you voted for" },
        { status: 400 },
      );
    }

    // Update poll: decrement option count and remove user from votedUsers
    const optionKey = votedOption;
    const currentCount = poll.options.get(optionKey) || 0;

    // Don't go below 0 votes
    const newCount = Math.max(0, currentCount - 1);

    const updateObj: any = {
      $pull: { votedUsers: token.id },
    };

    // Need to use a special syntax for updating a Map field in MongoDB
    updateObj[`options.${optionKey}`] = newCount;

    const updatedPoll = await PollModel.findByIdAndUpdate(pollId, updateObj, {
      new: true,
      runValidators: true,
    })
      .populate("postId")
      .populate("votedUsers", "name image");

    return NextResponse.json(updatedPoll);
  } catch (error: any) {
    console.error("Error removing vote from poll:", error);

    return NextResponse.json(
      { error: error.message || "Failed to remove vote" },
      { status: 500 },
    );
  }
}
