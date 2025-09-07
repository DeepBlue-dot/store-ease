// app/api/register/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema, userquerySchema } from "@/lib/validators/user/user";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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



export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const query = Object.fromEntries(url.searchParams.entries());
  const parsed = userquerySchema.safeParse(query);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const {
    page,
    limit,
    search,
    role,
    status,
    emailVerified,
    createdFrom,
    createdTo,
    select,
    sortBy,
    order,
  } = parsed.data;

  // Filters
  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }
  if (role) where.role = role;
  if (status) where.status = status;
  if (emailVerified) {
    where.emailVerified =
      emailVerified === "true" ? { not: null } : null;
  }
  if (createdFrom || createdTo) {
    where.createdAt = {};
    if (createdFrom) where.createdAt.gte = new Date(createdFrom);
    if (createdTo) where.createdAt.lte = new Date(createdTo);
  }

  // Safe default fields
  const safeFields = {
    id: true,
    name: true,
    email: true,
    role: true,
    status: true,
    image: true,
    emailVerified: true,
    createdAt: true,
    updatedAt: true,
  };

  const selectFields =
    select && select.length > 0
      ? Object.fromEntries(
          select.filter((f) => Object.keys(safeFields).includes(f)).map((f) => [f, true])
        )
      : safeFields;

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: selectFields,
      orderBy: { [sortBy]: order },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({
    data: users,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      sortBy,
      order,
    },
  });
}
