import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcrypt";
import { z } from "zod";
import connectDB from "@/lib/db/connect";
import UserModel from "@/models/User";

// Define validation schema
const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  locality: z.string().min(1, "Locality is required"),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    // Validate request body
    const result = userSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors }, { status: 400 });
    }

    const { name, email, password, locality } = result.data;

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create new user
    const user = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
      locality,
      points: 0,
      eventsHosted: 0,
      pollsVoted: 0,
      discussionsStarted: 0,
      petitionsCreated: 0,
    });

    // Return the user without password
    const { password: _, ...userWithoutPassword } = user.toObject();

    return NextResponse.json(
      { message: "User created successfully", user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create user" },
      { status: 500 }
    );
  }
}
