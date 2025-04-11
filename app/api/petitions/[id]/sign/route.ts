import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import connectDB from "@/lib/db/connect";
import PetitionModel from "@/models/Petition";
import UserModel from "@/models/User";
import PollModel from "@/models/Poll";

// POST /api/petitions/[id]/sign - Sign a petition
export async function POST(req: NextRequest, { params }: any) {
  try {
    const petitionId = params.id;
    const token = await getToken({ req });

    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const user = await UserModel.findById(token.id);
    const petition = await PetitionModel.findById(petitionId)
      .populate("postId")
      .populate("supporters");

    if (!petition)
      return NextResponse.json(
        { error: "Petition not found" },
        { status: 404 }
      );

    // Check if user has already signed
    if (
      petition.supporters.some(
        (supporter: any) => supporter._id.toString() === token.id
      )
    ) {
      return NextResponse.json({ error: "Already signed" }, { status: 409 });
    }

    // Update the petition with the new signature
    await PetitionModel.findByIdAndUpdate(
      petitionId,
      {
        $inc: { signatures: 1 },
        $addToSet: { supporters: token.id },
      },
      { new: true }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/petitions/[id]/sign - Remove signature
export async function DELETE(req: NextRequest, { params }: any) {
  try {
    const petitionId = params.id;
    const token = await getToken({ req });

    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const petition = await PetitionModel.findById(petitionId);

    if (!petition)
      return NextResponse.json(
        { error: "Petition not found" },
        { status: 404 }
      );

    // Check if user has signed the petition
    const isSupporter = petition.supporters.some(
      (id: any) => id.toString() === token.id
    );

    if (!isSupporter) {
      return NextResponse.json({ error: "Not signed" }, { status: 400 });
    }

    // Remove the signature
    await PetitionModel.findByIdAndUpdate(
      petitionId,
      {
        $inc: { signatures: -1 },
        $pull: { supporters: token.id },
      },
      { new: true }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
