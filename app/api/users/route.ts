// app/api/register/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators/user";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const json = await req.json();

    // Validate request body
    const parsed = registerSchema.safeParse(json);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return NextResponse.json(
        { error: "ValidationError", details: fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password, phone, address } = parsed.data;

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check for existing user
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: "EmailAlreadyInUse" },
        { status: 409 }
      );
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashed,
        phone,
        address,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        phone: true,
        address: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (err: any) {
    // Handle Prisma unique constraint just in case race condition
    if (err?.code === "P2002") {
      return NextResponse.json(
        { error: "EmailAlreadyInUse" },
        { status: 409 }
      );
    }

    console.error("Register error:", err);
    return NextResponse.json(
      { error: "InternalServerError" },
      { status: 500 }
    );
  }
}
