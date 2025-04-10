import { NextRequest, NextResponse } from "next/server";

// This route allows client-side error logging to the server logs
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { error, context } = body;

    console.error("[Client Error]", {
      message: error?.message || "Unknown error",
      stack: error?.stack,
      context,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Error Logger Failed]", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
