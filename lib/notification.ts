import NotificationModel from "@/models/Notification";
import User from "@/models/User";
import mongoose from "mongoose";

// Helper function to create notifications for users in a locality
export async function createLocalityNotification(
  message: string,
  locality: string,
  postId?: mongoose.Types.ObjectId | string
) {
  try {
    // Find all users in the specified locality
    const users = await User.find({ locality });

    if (!users || users.length === 0) {
      console.log(`No users found in locality: ${locality}`);
      return { success: false, message: "No users found in this locality" };
    }

    // Create an array to store notification creation promises
    const notificationPromises = [];

    // Create a notification for each user in the locality
    for (const user of users) {
      const notification = new NotificationModel({
        userId: user._id,
        message,
        locality,
        postId: postId || undefined,
        isRead: false,
      });

      // Save the notification
      notificationPromises.push(notification.save());

      // Add the notification reference to the user's notifications array
      user.notifications.push(notification._id);
      notificationPromises.push(user.save());
    }

    // Wait for all notifications to be created and saved
    await Promise.all(notificationPromises);

    return {
      success: true,
      message: `Created ${users.length} notifications for users in ${locality}`,
      count: users.length,
    };
  } catch (error) {
    console.error("Error creating locality notifications:", error);
    return {
      success: false,
      message: "Failed to create notifications",
      error,
    };
  }
}
