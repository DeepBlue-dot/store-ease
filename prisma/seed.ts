import { Prisma } from "../lib/generated/prisma";
import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";
import { prisma } from "@/lib/prisma";


async function main() {
  console.log("🧹 Cleaning up existing data...");
  await prisma.$transaction([
    prisma.rating.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.cartItem.deleteMany(),
    prisma.cart.deleteMany(),
    prisma.productImage.deleteMany(),
    prisma.product.deleteMany(),
    prisma.category.deleteMany(),
    prisma.account.deleteMany(),
    prisma.session.deleteMany(),
    prisma.user.deleteMany(),
  ]);
  console.log("✅ Database cleaned");

  console.log("\n👤 Seeding users...");
  const usersData: Prisma.UserCreateManyInput[] = [
    {
      name: "Admin User",
      email: "admin@storeease.com",
      password: await bcrypt.hash("admin123", 10),
      role: "ADMIN",
    },
    {
      name: "John Doe",
      email: "john@storeease.com",
      password: await bcrypt.hash("customer123", 10),
      role: "CUSTOMER",
      phone: "1234567890",
      address: "123 Main St",
    },
    {
      name: "Jane Smith",
      email: "jane@storeease.com",
      password: await bcrypt.hash("customer456", 10),
      role: "CUSTOMER",
      phone: "9876543210",
      address: "456 Oak Ave",
    },
  ];

  for (let i = 0; i < 10; i++) {
    usersData.push({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: await bcrypt.hash("password123", 10),
      role: "CUSTOMER",
      phone: faker.string.numeric(10),
      address: faker.location.streetAddress(),
    });
  }

  await prisma.user.createMany({ data: usersData, skipDuplicates: true });
  const users = await prisma.user.findMany();
  console.log(`✅ Seeded ${users.length} users`);

  console.log("\n📂 Seeding categories...");
  const categoryNames = [
    "Electronics",
    "Clothing",
    "Home & Kitchen",
    "Books",
    "Sports & Outdoors",
    "Beauty & Personal Care",
    "Toys & Games",
    "Automotive",
    "Health & Household",
    "Jewelry",
    "Furniture",
    "Grocery",
    "Patio & Garden",
    "Tools & Home Improvement",
  ];

  const categoriesData: Prisma.CategoryCreateManyInput[] = categoryNames.map((name) => ({
    name,
    imageUrl: faker.image.urlLoremFlickr({ category: "shopping" }),
  }));

  await prisma.category.createMany({ data: categoriesData, skipDuplicates: true });
  const categories = await prisma.category.findMany();
  console.log(`✅ Seeded ${categories.length} categories`);

  console.log("\n📦 Seeding products...");
  const productsData: Prisma.ProductCreateManyInput[] = Array.from({ length: 100 }, () => {
    const category = faker.helpers.arrayElement(categories);

    return {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: new Prisma.Decimal(faker.commerce.price({ min: 5, max: 1000 })),
      stock: faker.number.int({ min: 0, max: 200 }),
      categoryId: category.id,
    };
  });

  await prisma.product.createMany({ data: productsData });
  const products = await prisma.product.findMany();
  console.log(`✅ Seeded ${products.length} products`);

  console.log("🖼️ Seeding product images...");
  const productImages: Prisma.ProductImageCreateManyInput[] = [];
  for (const product of products) {
    const images = Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, () => ({
      url: faker.image.urlLoremFlickr({ category: "product", width: 400, height: 400 }),
      productId: product.id,
    }));
    productImages.push(...images);
  }
  await prisma.productImage.createMany({ data: productImages });
  console.log(`✅ Seeded ${productImages.length} product images`);

  console.log("\n🛒 Seeding carts...");
  const customerUsers = users.filter((u) => u.role === "CUSTOMER");
  for (const user of customerUsers) {
    const cartItems = faker.helpers
      .arrayElements(products, { min: 0, max: 5 })
      .map((product) => ({
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
  console.log(`✅ Seeded carts for ${customerUsers.length} customers`);

  console.log("\n📦 Seeding orders...");
  const orderStatuses = ["PENDING", "COMPLETED", "CANCELED", "FAILED"] as const;

  let orderCountTotal = 0;
  for (const user of customerUsers) {
    const orderCount = faker.number.int({ min: 1, max: 8 });
    orderCountTotal += orderCount;

    for (let i = 0; i < orderCount; i++) {
      const orderItems = faker.helpers.arrayElements(products, { min: 1, max: 5 }).map((product) => ({
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
  console.log(`✅ Seeded ${orderCountTotal} orders`);

  console.log("\n⭐ Seeding ratings...");
  const ratingsData: Prisma.RatingCreateManyInput[] = [];
  for (const product of products) {
    const ratingCount = faker.number.int({ min: 3, max: 15 });
    const selectedCustomers = faker.helpers.arrayElements(customerUsers, ratingCount);

    for (const customer of selectedCustomers) {
      ratingsData.push({
        userId: customer.id,
        productId: product.id,
        rating: faker.number.int({ min: 1, max: 5 }),
        review: faker.lorem.paragraph(),
        createdAt: faker.date.past({ years: 1 }),
      });
    }
  }
  await prisma.rating.createMany({ data: ratingsData });
  console.log(`✅ Seeded ${ratingsData.length} ratings`);

  console.log("\n📊 Updating average ratings...");
  const productAverages = await prisma.rating.groupBy({
    by: ["productId"],
    _avg: { rating: true },
  });

  await prisma.$transaction(
    productAverages.map((avg) =>
      prisma.product.update({
        where: { id: avg.productId },
        data: { averageRating: avg._avg.rating ?? 0 },
      })
    )
  );
  console.log("✅ Updated average ratings for products");

  console.log("\n🎉 Seeding complete!");
  console.log(`📊 Final counts:
  - ${users.length} users
  - ${categories.length} categories
  - ${products.length} products
  - ${productImages.length} product images
  - ${ratingsData.length} ratings
  - ${orderCountTotal} orders
  - ${customerUsers.length} carts
  `);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
