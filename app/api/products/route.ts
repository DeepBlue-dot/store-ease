import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/products - Get all products
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        images: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    
    // Convert Decimal prices to numbers for client compatibility
    const productsWithNumbers = products.map(product => ({
      ...product,
      price: product.price.toNumber(), // Convert Decimal to number
    }));
    
    return NextResponse.json(productsWithNumbers);
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, price, stock, categoryId, images } = body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: price, // This is now a number from the request
        stock,
        categoryId: categoryId || null,
        images: {
          create: images?.map((url: string) => ({ url })) || [],
        },
      },
      include: {
        category: true,
        images: true,
      },
    });

    // Convert Decimal price to number for response
    const productWithNumberPrice = {
      ...product,
      price: product.price.toNumber(), // Convert Decimal to number
    };

    return NextResponse.json(productWithNumberPrice, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}