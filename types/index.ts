import { ObjectId } from "mongoose";
import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface User {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  image?: string;
  role: "user" | "moderator" | "admin";
  locality: string;
  points: number;
  eventsHosted: number;
  pollsVoted: number;
  discussionsStarted: number;
  petitionsCreated: number;
  createdAt?: Date;
  updatedAt?: Date;
  notifications: ObjectId[];
}

export interface Post {
  _id?: string;
  type: "general" | "event" | "poll" | "petition";
  title: string;
  description: string;
  summarizedDescription?: string;
  locality: string;
  priority: "low" | "medium" | "high";
  category: string;
  createdBy: ObjectId; // User ID
  pollId?: ObjectId;
  eventId?: ObjectId;
  petitionId?: ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Event {
  _id?: string;
  postId: ObjectId;
  startDate: Date;
  duration: number; // in minutes
  location: string;
  organizer: ObjectId; // User ID
  attendees: ObjectId[]; // Array of User IDs
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Discussion {
  _id?: string;
  postId: ObjectId;
  content: string;
  createdBy: ObjectId; // User ID
  parentId?: ObjectId; // For nested discussions
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Poll {
  _id?: string;
  postId: ObjectId;
  petitionId?: ObjectId;
  options: Record<string, number>; // {optionName: voteCount}
  votedUsers: ObjectId[]; // Array of User IDs
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Petition {
  _id?: string;
  postId: ObjectId;
  pollId?: ObjectId;
  target: string;
  goal: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Notification {
  _id?: string;
  userId: ObjectId;
  postId?: ObjectId;
  message: string;
  isRead: boolean;
  locality: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Award {
  _id?: string;
  userId: ObjectId;
  type: string;
  description: string;
  earnedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
