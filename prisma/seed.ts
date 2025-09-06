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

  // Add 10 more fake customers
  for (let i = 0; i < 10; i++) {
    usersData.push({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: await bcrypt.hash("password123", 10),
      role: "CUSTOMER" as const,
      phone: faker.phone.number(),
      address: faker.location.streetAddress(),
    });
  }

  await prisma.user.createMany({ data: usersData, skipDuplicates: true });
  const users = await prisma.user.findMany();

  // --- CATEGORIES ---
  const categoryNames = [
    "Electronics", "Clothing", "Home & Kitchen", "Books", 
    "Sports & Outdoors", "Beauty & Personal Care", "Toys & Games",
    "Automotive", "Health & Household", "Jewelry", "Furniture",
    "Grocery", "Patio & Garden", "Tools & Home Improvement"
  ];

  const categoriesData = categoryNames.map(name => ({
    name,
    imageUrl: faker.image.urlLoremFlickr({ category: "shopping" })
  }));

  await prisma.category.createMany({ 
    data: categoriesData, 
    skipDuplicates: true 
  });
  const categories = await prisma.category.findMany();

  // --- PRODUCTS ---
  const productsData = [];
  for (let i = 0; i < 100; i++) {
    const category = faker.helpers.arrayElement(categories);
    
    productsData.push({
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: new Prisma.Decimal(faker.commerce.price({ min: 5, max: 1000 })),
      stock: faker.number.int({ min: 0, max: 200 }),
      categoryId: category.id,
      images: {
        create: Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, () => ({
          url: faker.image.urlLoremFlickr({
            category: "product",
            width: 400,
            height: 400,
          }),
        })),
      },
    });
  }

  // Create products one by one to handle relations
  for (const product of productsData) {
    await prisma.product.create({ data: product });
  }

  const products = await prisma.product.findMany();

  // --- CARTS ---
  for (const user of users.filter(u => u.role === "CUSTOMER")) {
    const cartItems = faker.helpers
      .arrayElements(products, { min: 0, max: 5 })
      .map(product => ({
        productId: product.id,
        qty: faker.number.int({ min: 1, max: 3 }),
      }));

    if (cartItems.length > 0) {
      await prisma.cart.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          items: { create: cartItems },
        },
      });
    }
  }

  // --- ORDERS ---
  const orderStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
  
  for (const user of users.filter(u => u.role === "CUSTOMER")) {
    const orderCount = faker.number.int({ min: 1, max: 8 });
    
    for (let i = 0; i < orderCount; i++) {
      const orderItems = faker.helpers
        .arrayElements(products, { min: 1, max: 5 })
        .map(product => ({
          productId: product.id,
          qty: faker.number.int({ min: 1, max: 3 }),
          price: product.price,
        }));

      const total = orderItems.reduce(
        (sum, item) => sum.add(item.price.mul(item.qty)),
        new Prisma.Decimal(0)
      );

      await prisma.order.create({
        data: {
          userId: user.id,
          status: faker.helpers.arrayElement(orderStatuses),
          totalPrice: total,
          items: { create: orderItems },
          createdAt: faker.date.past({ years: 1 }),
        },
      });
    }
  }

  // --- RATINGS ---
  for (const product of products) {
    const ratingCount = faker.number.int({ min: 3, max: 15 });
    const customerUsers = users.filter(u => u.role === "CUSTOMER");
    
    for (let i = 0; i < ratingCount; i++) {
      const customer = faker.helpers.arrayElement(customerUsers);
      
      await prisma.rating.create({
        data: {
          userId: customer.id,
          productId: product.id,
          rating: faker.number.int({ min: 1, max: 5 }),
          review: faker.lorem.paragraph(),
          createdAt: faker.date.past({ years: 1 }),
        },
      });
    }
  }

  // --- UPDATE AVERAGE RATINGS ---
  for (const product of products) {
    const avg = await prisma.rating.aggregate({
      where: { productId: product.id },
      _avg: { rating: true },
    });

    await prisma.product.update({
      where: { id: product.id },
      data: { averageRating: avg._avg.rating ?? 0 },
    });
  }

  console.log("✅ Seeding complete with extensive fake data!");
  console.log(`📊 Created: 
  - ${users.length} users
  - ${categories.length} categories
  - ${products.length} products
  - Multiple carts, orders, and ratings`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });