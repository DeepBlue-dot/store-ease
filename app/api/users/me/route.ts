import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // adjust path to your authOptions
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import fs from "fs";
import formidable from "formidable";
import { profileSchema } from "@/lib/validators/user/user";
import { uploadImage, deleteImage } from "@/lib/cloudinary";
import { getPublicIdFromUrl } from "@/lib/cloudinary-utils";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      phone: true,
      address: true,
      email: true,
      role: true,
      status: true,
      image: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json(user);
}

export const config = {
  api: {
    bodyParser: false, // ⛔ disable bodyParser, formidable will handle it
  },
};

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("PATCH /api/users/me called");

  try {
    const formData = await req.formData();

    // ✅ Extract fields
    const name = formData.get("name") as string | null;
    const phone = formData.get("phone") as string | null;
    const address = formData.get("address") as string | null;
    const file = formData.get("image") as File | null;

    // ✅ Validate with Zod
    const parsed = profileSchema.safeParse({ name, phone, address });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // ✅ Fetch current user (for old image cleanup)
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });

    let imageUrl: string | undefined;

    // ✅ Handle new image upload
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      imageUrl = await uploadImage(buffer, "profile_images");

      if (currentUser?.image) {
        const publicId = getPublicIdFromUrl(currentUser.image);
        if (publicId) {
          await deleteImage(publicId);
        }
      }
    }

    // ✅ Update DB
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...parsed.data,
        ...(imageUrl && { image: imageUrl }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        image: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (err) {
    console.error("Profile update error:", err);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
