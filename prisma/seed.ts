import { PrismaClient } from "../lib/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {

  console.log("🧹 Cleaning up existing data...");
  
  await prisma.rating.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log("🌱 Seeding database...");

  // --- USERS ---
  const adminPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@storeease.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@storeease.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const customerPassword1 = await bcrypt.hash("customer123", 10);
  const customer1 = await prisma.user.upsert({
    where: { email: "john@storeease.com" },
    update: {},
    create: {
      name: "John Doe",
      email: "john@storeease.com",
      password: customerPassword1,
      role: "CUSTOMER",
      phone: "1234567890",
      address: "123 Main St",
    },
  });

  const customerPassword2 = await bcrypt.hash("customer456", 10);
  const customer2 = await prisma.user.upsert({
    where: { email: "jane@storeease.com" },
    update: {},
    create: {
      name: "Jane Smith",
      email: "jane@storeease.com",
      password: customerPassword2,
      role: "CUSTOMER",
      phone: "9876543210",
      address: "456 Oak Ave",
    },
  });

  // --- CATEGORIES ---
  await prisma.category.createMany({
    data: [
      { name: "Electronics" },
      { name: "Clothing" },
      { name: "Home & Kitchen" },
    ],
    skipDuplicates: true,
  });

  const electronics = await prisma.category.findFirst({
    where: { name: "Electronics" },
  });
  const clothing = await prisma.category.findFirst({
    where: { name: "Clothing" },
  });
  const kitchen = await prisma.category.findFirst({
    where: { name: "Home & Kitchen" },
  });

  // --- PRODUCTS ---
  const headphone = await prisma.product.findFirst({
    where: { name: "Wireless Headphones" },
  });
  const smartphone = await prisma.product.findFirst({
    where: { name: "Smartphone" },
  });
  const jacket = await prisma.product.findFirst({
    where: { name: "Denim Jacket" },
  });
  const blender = await prisma.product.findFirst({
    where: { name: "Blender" },
  });

  let products = [];

  if (!headphone && electronics) {
    products.push(
      await prisma.product.create({
        data: {
          name: "Wireless Headphones",
          description: "Noise-cancelling headphones with 20h battery life",
          price: 99.99,
          stock: 50,
          categoryId: electronics.id,
          images: {
            create: [
              { url: "https://via.placeholder.com/300?text=Headphones" },
            ],
          },
        },
      })
    );
  }
  if (!smartphone && electronics) {
    products.push(
      await prisma.product.create({
        data: {
          name: "Smartphone",
          description: "Latest-gen smartphone with 128GB storage",
          price: 699.99,
          stock: 30,
          categoryId: electronics.id,
          images: {
            create: [
              { url: "https://via.placeholder.com/300?text=Smartphone" },
            ],
          },
        },
      })
    );
  }
  if (!jacket && clothing) {
    products.push(
      await prisma.product.create({
        data: {
          name: "Denim Jacket",
          description: "Stylish denim jacket for all seasons",
          price: 59.99,
          stock: 20,
          categoryId: clothing.id,
          images: {
            create: [
              { url: "https://via.placeholder.com/300?text=Denim+Jacket" },
            ],
          },
        },
      })
    );
  }
  if (!blender && kitchen) {
    products.push(
      await prisma.product.create({
        data: {
          name: "Blender",
          description: "High-power blender for smoothies and sauces",
          price: 39.99,
          stock: 15,
          categoryId: kitchen.id,
          images: {
            create: [{ url: "https://via.placeholder.com/300?text=Blender" }],
          },
        },
      })
    );
  }

  // Fetch final product list (including existing)
  const allProducts = await prisma.product.findMany();

  // --- CARTS ---
  await prisma.cart.upsert({
    where: { userId: customer1.id },
    update: {},
    create: {
      userId: customer1.id,
      items: {
        create: [
          { productId: allProducts[0].id, qty: 1 },
          { productId: allProducts[2].id, qty: 2 },
        ],
      },
    },
  });

  await prisma.cart.upsert({
    where: { userId: customer2.id },
    update: {},
    create: {
      userId: customer2.id,
      items: {
        create: [{ productId: allProducts[1].id, qty: 1 }],
      },
    },
  });

  // --- ORDERS ---
  await prisma.order.create({
    data: {
      userId: customer1.id,
      totalPrice: 159.97,
      status: "COMPLETED",
      items: {
        create: [
          { productId: allProducts[0].id, qty: 1, price: allProducts[0].price },
          { productId: allProducts[2].id, qty: 1, price: allProducts[2].price },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      userId: customer2.id,
      totalPrice: 699.99,
      status: "PENDING",
      items: {
        create: [
          { productId: allProducts[1].id, qty: 1, price: allProducts[1].price },
        ],
      },
    },
  });

  // --- RATINGS ---
  await prisma.rating.createMany({
    data: [
      {
        userId: customer1.id,
        productId: allProducts[0].id,
        rating: 5,
        review: "Amazing sound quality and comfort!",
      },
      {
        userId: customer2.id,
        productId: allProducts[1].id,
        rating: 4,
        review: "Great phone, but battery could be better.",
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
