import { prisma } from './prisma';

// These functions will be replaced with API calls later
export async function getDashboardData() {
  const [
    totalOrders,
    pendingOrders,
    totalProducts,
    lowStockProducts,
    totalUsers,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.product.count(),
    prisma.product.count({ where: { stock: { lt: 10 } } }), // Example of low stock
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
  ]);

  return {
    totalOrders,
    pendingOrders,
    totalProducts,
    lowStockProducts,
    totalUsers,
  };
}

export async function getProducts() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      images: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Convert Decimal to number for React compatibility
  return products.map(product => ({
    ...product,
    price: product.price.toNumber(),
  }));
}

export async function getOrders() {
  const orders = await prisma.order.findMany({
    include: {
      user: true,
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Convert Decimal to number for React compatibility
  return orders.map(order => ({
    ...order,
    totalPrice: order.totalPrice.toNumber(),
    items: order.items.map(item => ({
      ...item,
      price: item.price.toNumber(),
    })),
  }));
}

export async function getUsers() {
  return await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getCategories() {
  return await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });
}