import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // adjust path to your authOptions
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import cloudinary from "@/lib/cloudinary";
import fs from "fs";
import formidable from "formidable";
import { profileSchema } from "@/lib/validators/user/user";
import { parseForm } from "@/lib/utils";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch user from DB (in case role/status/email changed after login)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
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

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { fields, files } = await parseForm(req);

    // Validate text fields
    const parsed = profileSchema.safeParse(fields);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    let imageUrl: string | undefined;

    // Handle file upload
    if (files.image) {
      const file = Array.isArray(files.image) ? files.image[0] : files.image;
      if (file?.filepath) {
        const upload = await cloudinary.uploader.upload(file.filepath, {
          folder: "profile_images",
          resource_type: "image",
        });

        imageUrl = upload.secure_url;

        // cleanup tmp file
        fs.unlinkSync(file.filepath);
      }
    }

    // Update DB
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
  } catch (err: any) {
    console.error("Profile update error:", err);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
