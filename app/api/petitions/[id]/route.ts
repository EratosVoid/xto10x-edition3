import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import mongoose from "mongoose";

import connectDB from "@/lib/db/connect";
import PetitionModel from "@/models/Petition";
import UserModel from "@/models/User";
import PostModel from "@/models/Post";

// GET /api/petitions/[id] - Get a specific petition
export async function GET(req: NextRequest, { params }: any) {
  try {
    const petitionId = params.id;

    // Validate petition ID
    if (!mongoose.Types.ObjectId.isValid(petitionId)) {
      return NextResponse.json(
        { error: "Invalid petition ID" },
        { status: 400 }
      );
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

    // Find petition by ID and populate related fields
    const petition = await PetitionModel.findById(petitionId)
      .populate("postId")
      .populate("supporters", "name email image");

    // Check if petition exists
    if (!petition) {
      return NextResponse.json(
        { error: "Petition not found" },
        { status: 404 }
      );
    }

    // Check if user has access (same locality as the post)
    if (petition.postId.locality !== user.locality) {
      return NextResponse.json(
        { error: "You don't have access to this petition" },
        { status: 403 }
      );
    }

    return NextResponse.json(petition);
  } catch (error: any) {
    console.error("Error fetching petition:", error);

    return NextResponse.json(
      { error: error.message || "Failed to fetch petition" },
      { status: 500 }
    );
  }
}

// PUT /api/petitions/[id] - Update a petition
export async function PUT(req: NextRequest, { params }: any) {
  try {
    const petitionId = params.id;

    // Validate petition ID
    if (!mongoose.Types.ObjectId.isValid(petitionId)) {
      return NextResponse.json(
        { error: "Invalid petition ID" },
        { status: 400 }
      );
    }

    // Check authentication
    const token = await getToken({ req });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Find the petition
    const petition =
      await PetitionModel.findById(petitionId).populate("postId");

    if (!petition) {
      return NextResponse.json(
        { error: "Petition not found" },
        { status: 404 }
      );
    }

    // Check if user is the creator of the associated post
    if (petition.postId.createdBy.toString() !== token.id) {
      return NextResponse.json(
        { error: "You can only edit petitions for your own posts" },
        { status: 403 }
      );
    }

    // Get update data
    const body = await req.json();
    const { target, goal } = body;

    // Update petition
    const updatedPetition = await PetitionModel.findByIdAndUpdate(
      petitionId,
      {
        ...(target && { target }),
        ...(goal && { goal }),
      },
      { new: true, runValidators: true }
    )
      .populate("postId")
      .populate("supporters", "name email image");

    return NextResponse.json(updatedPetition);
  } catch (error: any) {
    console.error("Error updating petition:", error);

    return NextResponse.json(
      { error: error.message || "Failed to update petition" },
      { status: 500 }
    );
  }
}

// DELETE /api/petitions/[id] - Delete a petition
export async function DELETE(req: NextRequest, { params }: any) {
  try {
    const petitionId = params.id;

    // Validate petition ID
    if (!mongoose.Types.ObjectId.isValid(petitionId)) {
      return NextResponse.json(
        { error: "Invalid petition ID" },
        { status: 400 }
      );
    }

    // Check authentication
    const token = await getToken({ req });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Find petition
    const petition =
      await PetitionModel.findById(petitionId).populate("postId");

    if (!petition) {
      return NextResponse.json(
        { error: "Petition not found" },
        { status: 404 }
      );
    }

    // Check if user is the creator of the associated post or an admin/moderator
    const user = await UserModel.findById(token.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isAuthorized =
      petition.postId.createdBy.toString() === token.id ||
      user.role === "admin" ||
      user.role === "moderator";

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "You don't have permission to delete this petition" },
        { status: 403 }
      );
    }

    // Find the associated post
    if (petition.postId) {
      // Remove petition reference from post
      await PostModel.findByIdAndUpdate(petition.postId._id, {
        $unset: { petitionId: 1 },
      });
    }

    // Delete petition
    await PetitionModel.findByIdAndDelete(petitionId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting petition:", error);

    return NextResponse.json(
      { error: error.message || "Failed to delete petition" },
      { status: 500 }
    );
  }
}
