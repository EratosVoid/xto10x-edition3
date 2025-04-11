import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import connectDB from "@/lib/db/connect";
import PetitionModel from "@/models/Petition";
import PollModel from "@/models/Poll";
import UserModel from "@/models/User";

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
      .populate("pollId");

    if (!petition)
      return NextResponse.json(
        { error: "Petition not found" },
        { status: 404 },
      );
    if (!petition.pollId)
      return NextResponse.json(
        { error: "Associated poll not found" },
        { status: 400 },
      );

    const poll = await PollModel.findById(petition.pollId);

    if (poll.votedUsers.includes(token.id as any)) {
      return NextResponse.json({ error: "Already signed" }, { status: 409 });
    }

    const currentCount = poll.options.get("Yes") || 0;
    const updateObj: any = { $addToSet: { votedUsers: token.id } };

    updateObj["options.Yes"] = currentCount + 1;

    await PollModel.findByIdAndUpdate(petition.pollId._id, updateObj, {
      new: true,
    });

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
    const petition =
      await PetitionModel.findById(petitionId).populate("pollId");

    if (!petition || !petition.pollId)
      return NextResponse.json(
        { error: "Petition or poll not found" },
        { status: 404 },
      );

    const poll = await PollModel.findById(petition.pollId);

    if (!poll.votedUsers.includes(token.id as any)) {
      return NextResponse.json({ error: "Not signed" }, { status: 400 });
    }

    const currentCount = poll.options.get("Yes") || 0;
    const updateObj: any = { $pull: { votedUsers: token.id } };

    updateObj["options.Yes"] = Math.max(0, currentCount - 1);

    await PollModel.findByIdAndUpdate(petition.pollId._id, updateObj, {
      new: true,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
