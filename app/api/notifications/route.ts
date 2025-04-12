import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import connectDB from "@/lib/db/connect";
import NotificationModel from "@/models/Notification";
import UserModel from "@/models/User";

// GET /api/notifications - Get all notifications for the current user
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const token = await getToken({ req });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get user
    const user = await UserModel.findById(token.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const page = parseInt(url.searchParams.get("page") || "1");
    const unreadOnly = url.searchParams.get("unreadOnly") === "true";

    // Build query for notifications belonging to the user
    const query: any = { userId: token.id };

    // Add unread filter if requested
    if (unreadOnly) {
      query.isRead = false;
    }

    // Count total notifications for pagination
    const total = await NotificationModel.countDocuments(query);

    // Get notifications with pagination, sorted by newest first
    const notifications = await NotificationModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("postId", "title type");

    return NextResponse.json({
      notifications,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        unread: await NotificationModel.countDocuments({
          userId: token.id,
          isRead: false,
        }),
      },
    });
  } catch (error: any) {
    console.error("Error fetching notifications:", error);

    return NextResponse.json(
      { error: error.message || "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// PUT /api/notifications - Mark notifications as read
export async function PUT(req: NextRequest) {
  try {
    // Check authentication
    const token = await getToken({ req });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get request body
    const body = await req.json();
    const { notificationIds, markAll } = body;

    // If markAll is true, mark all notifications as read
    if (markAll) {
      await NotificationModel.updateMany(
        { userId: token.id, isRead: false },
        { isRead: true }
      );

      return NextResponse.json({
        message: "All notifications marked as read",
      });
    }

    // If notificationIds are provided, mark specified notifications as read
    if (Array.isArray(notificationIds) && notificationIds.length > 0) {
      await NotificationModel.updateMany(
        {
          _id: { $in: notificationIds },
          userId: token.id, // Ensure only the user's notifications are updated
        },
        { isRead: true }
      );

      return NextResponse.json({
        message: `${notificationIds.length} notifications marked as read`,
      });
    }

    return NextResponse.json(
      { error: "No notifications specified" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error updating notifications:", error);

    return NextResponse.json(
      { error: error.message || "Failed to update notifications" },
      { status: 500 }
    );
  }
}
