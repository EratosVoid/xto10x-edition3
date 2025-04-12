import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcrypt";
import { z } from "zod";

import connectDB from "@/lib/db/connect";
import UserModel from "@/models/User";

// Define validation schema
const userSchema = z.object({
  voterId: z.string().regex(/^[a-zA-Z0-9]+$/, "Voter ID must be alphanumeric"),
  email: z.string().email("Invalid email address").optional(),
  phoneNumber: z
    .string()
    .regex(/^\d{10}$/, "Invalid phone number").optional(),
  password: z
    .string().min(6, "Password must be at least 6 characters long"),
  name: z.string().min(1, "Name is required"),
  locality: z.string().min(1, "Locality is required"),
});

export async function POST(req: NextRequest) {
  try {
    console.log("Registration API route hit");
    await connectDB();

    const body = await req.json();

    console.log("Registration request body:", {
      ...body,
      password: "[REDACTED]",
    });

    // Validate request body
    const result = userSchema.safeParse(body);

    if (!result.success) {
      console.log("Validation error:", result.error.errors);

      return NextResponse.json({ error: result.error.errors }, { status: 400 });
    }

    const { voterId, email, phoneNumber, password, name, locality } = result.data;

    // Check if user already exists
    const existingUser = await UserModel.findOne({ voterId });

    if (existingUser) {
      console.log("User already exists:", voterId);

      return NextResponse.json(
        { error: "User with this voter ID already exists" },
        { status: 409 },
      );
    }

    // Hash the password
    const hashedPassword = await hash(password, 10);

    // Create new user
    const newUser = new UserModel({
      voterId,
      email,
      phoneNumber,
      password: hashedPassword,
      name, locality,
    });

    // Save the new user to the database
    const user = await newUser.save();


    console.log("User created successfully:", user._id);

    return NextResponse.json(
      { message: "User created successfully", user },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating user:", error);

    return NextResponse.json(
      { error: error.message || "Failed to create user" },
      { status: 500 },
    );
  }
}
