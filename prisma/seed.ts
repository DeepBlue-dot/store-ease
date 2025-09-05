import { PrismaClient, Prisma } from "../lib/generated/prisma";
import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";

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
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  console.log("🌱 Seeding database...");

  // --- USERS ---
  const usersData = [
    {
      name: "Admin User",
      email: "admin@storeease.com",
      password: await bcrypt.hash("admin123", 10),
      role: "ADMIN" as const,
    },
    {
      name: "John Doe",
      email: "john@storeease.com",
      password: await bcrypt.hash("customer123", 10),
      role: "CUSTOMER" as const,
      phone: "1234567890",
      address: "123 Main St",
    },
    {
      name: "Jane Smith",
      email: "jane@storeease.com",
      password: await bcrypt.hash("customer456", 10),
      role: "CUSTOMER" as const,
      phone: "9876543210",
      address: "456 Oak Ave",
    },
  ];

  await prisma.user.createMany({ data: usersData, skipDuplicates: true });
  const [admin, customer1, customer2] = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    take: 3,
  });

  // --- BASE CATEGORIES ---
  await prisma.category.createMany({
    data: [
      { name: "Electronics" },
      { name: "Clothing" },
      { name: "Home & Kitchen" },
    ],
    skipDuplicates: true,
  });

  const [electronics, clothing, kitchen] = await prisma.category.findMany({
    orderBy: { createdAt: "asc" },
    take: 3,
  });

  // --- CURATED PRODUCTS ---
  // --- CURATED PRODUCTS ---
  const curatedProductsData = [
    {
      name: "Wireless Headphones",
      description: "Noise-cancelling headphones with 20h battery life",
      price: new Prisma.Decimal("99.99"),
      stock: 50,
      categoryId: electronics.id,
      images: {
        create: [{ url: "https://via.placeholder.com/300?text=Headphones" }],
      },
    },
    {
      name: "Smartphone",
      description: "Latest-gen smartphone with 128GB storage",
      price: new Prisma.Decimal("699.99"),
      stock: 30,
      categoryId: electronics.id,
      images: {
        create: [{ url: "https://via.placeholder.com/300?text=Smartphone" }],
      },
    },
    {
      name: "Denim Jacket",
      description: "Stylish denim jacket for all seasons",
      price: new Prisma.Decimal("59.99"),
      stock: 20,
      categoryId: clothing.id,
      images: {
        create: [{ url: "https://via.placeholder.com/300?text=Denim+Jacket" }],
      },
    },
    {
      name: "Blender",
      description: "High-power blender for smoothies and sauces",
      price: new Prisma.Decimal("39.99"),
      stock: 15,
      categoryId: kitchen.id,
      images: {
        create: [{ url: "https://via.placeholder.com/300?text=Blender" }],
      },
    },
  ];

  for (const product of curatedProductsData) {
    const existing = await prisma.product.findFirst({
      where: { name: product.name },
    });

    if (!existing) {
      await prisma.product.create({ data: product });
    }
  }

  // --- EXTRA FAKE CATEGORIES ---
  for (let i = 0; i < 5; i++) {
    await prisma.category.create({
      data: {
        name: faker.commerce.department() + " " + faker.word.noun(),
        imageUrl: faker.image.urlLoremFlickr({ category: "store" }),
      },
    });
  }

  const categories = await prisma.category.findMany();

  // --- EXTRA FAKE PRODUCTS ---
  for (let i = 0; i < 20; i++) {
    const category = faker.helpers.arrayElement(categories);

    await prisma.product.create({
      data: {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: new Prisma.Decimal(faker.commerce.price({ min: 10, max: 500 })),
        stock: faker.number.int({ min: 5, max: 100 }),
        categoryId: category.id,
        images: {
          create: [
            {
              url: faker.image.urlLoremFlickr({
                category: "product",
                width: 300,
                height: 300,
              }),
            },
          ],
        },
      },
    });
  }

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

  // --- FAKE ORDERS ---
  for (const user of [customer1, customer2]) {
    for (let i = 0; i < 3; i++) {
      const orderItems = faker.helpers
        .arrayElements(allProducts, {
          min: 1,
          max: 3,
        })
        .map((p) => ({
          productId: p.id,
          qty: faker.number.int({ min: 1, max: 3 }),
          price: p.price,
        }));

      const total = orderItems.reduce(
        (sum, item) => sum.add(item.price.mul(item.qty)),
        new Prisma.Decimal(0)
      );

      await prisma.order.create({
        data: {
          userId: user.id,
          status: faker.helpers.arrayElement(["PENDING", "COMPLETED"]),
          totalPrice: total,
          items: { create: orderItems },
        },
      });
    }
  }

  // --- RATINGS ---
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
  });

  for (const product of allProducts) {
    for (const customer of faker.helpers.arrayElements(customers, {
      min: 1,
      max: 3,
    })) {
      await prisma.rating.create({
        data: {
          userId: customer.id,
          productId: product.id,
          rating: faker.number.int({ min: 3, max: 5 }),
          review: faker.lorem.sentence(),
        },
      });
    }
  }

  // --- UPDATE AVERAGE RATINGS ---
  for (const product of allProducts) {
    const avg = await prisma.rating.aggregate({
      where: { productId: product.id },
      _avg: { rating: true },
    });

    await prisma.product.update({
      where: { id: product.id },
      data: { averageRating: avg._avg.rating ?? 0 },
    });
  }

  console.log("✅ Seeding complete with fake data!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
