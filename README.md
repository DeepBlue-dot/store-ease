# 🛍️ StoreEase - Single-Vendor E-commerce (MVP)

![StoreEase Logo](https://store-ease-alpha.vercel.app/logo.png)

> A modern single-vendor e-commerce platform built with **Next.js 15**, **React 19**, **TypeScript**, and **Prisma ORM** — designed for simplicity, speed, and scalability.

---

## 🚀 Demo

🔗 **Live Demo:** [https://store-ease-alpha.vercel.app/](https://store-ease-alpha.vercel.app/)  
🔗 **GitHub Repository:** [StoreEase on GitHub](https://github.com/DeepBlue-dot/store-ease)  

---

## 🎯 Core Goals

- 🛒 Customers can **browse, search, and filter products**
- 🧺 Add to cart and **place orders**
- 📦 Orders flow through statuses: `Pending → Completed → Failed → Canceled`
- 💵 Supports **Cash on Delivery (COD)** or manual confirmation
- ⭐ Customers can **rate products** (1–5 stars)
- 🧑‍💼 Admin can manage **products, inventory, orders, and users**

---

## 🛠️ Features Breakdown

### 👤 Customer Side

#### 🔐 Authentication
- Register, login, logout  
- Manage profile (update info, change password)  
- Password recovery (email/OTP-based, optional)

#### 🛍 Product Browsing
- Product listing with category, price, stock, rating  
- Product detail page with full description, images, price, and rating

#### 🔎 Search & Filter
- Keyword search  
- Filters by category, price range, rating, and stock availability  

#### 🛒 Cart
- Add/remove/update items  
- Persistent cart across sessions  

#### 📦 Checkout
- Place orders (COD/manual confirmation)
- Order confirmation + optional email  

#### 📑 Order Tracking
- View all past orders and statuses  
- Cancel orders (optional)

#### ⭐ Ratings & Reviews
- Rate products (1–5 stars)
- Optional written review  

---

### 🧑‍💼 Admin Side (Single Admin)

#### 📦 Product Management
- Add / Edit / Delete products  
- Manage product categories  

#### 📊 Inventory Management
- Manual stock updates  
- Auto stock reduction on confirmed orders  

#### 🧾 Order Management
- View and update order statuses:


Pending → Completed → Canceled → Failed


#### 👥 User Management
- View all registered users  
- Soft deactivate users (optional)

---

## ⚙️ Tech Stack Overview

### ⚡ Framework & Core
- **Next.js 15** – React-based full-stack framework with Turbopack  
- **React 19** – Latest React features for dynamic UI  
- **TypeScript 5** – Type-safe development  

### 🎨 Styling & UI
- **Tailwind CSS 4** – Utility-first CSS  
- **@shadcn/ui** – Prebuilt, accessible components  
- **Radix UI** – Low-level UI primitives  
- **lucide-react** – Icon set for React  
- **clsx**, **tailwind-merge**, **tw-animate-css** – Utility libraries  

### 🔐 Authentication & Security
- **NextAuth.js** – Authentication & session management  
- **@next-auth/prisma-adapter** – Database integration  
- **bcryptjs** – Password hashing  

### 🗄 Database & ORM
- **Prisma ORM** – Type-safe ORM  
- **PostgreSQL** (or other supported DB)  
- **@prisma/extension-accelerate** – Query caching  

### ☁️ File Storage & Media
- **Cloudinary** – Image storage & optimization  
- **formidable** – File uploads  

### 📬 Email & Notifications
- **Mailjet** – Transactional email delivery  
- **Radix Toast** – In-app notifications  

### 🧰 Utilities
- **Axios** – API communication  
- **Zod** – Schema validation  
- **React Hook Form** + **@hookform/resolvers** – Form handling  
- **dotenv** – Environment management  
- **faker-js** – Mock data generation  

---

## 🧪 Development Tools

- **tsx** – Fast TypeScript runtime  
- **PostCSS + Tailwind** – CSS transformations  
- **Type Definitions** – Node & React types  

---

## 🖼️ Screenshots

| Preview | |
|----------|--|
| ![](https://raw.githubusercontent.com/DeepBlue-dot/store-ease/refs/heads/main/about/ScreenShot%20Tool%20-20251111145852.png) | ![](https://raw.githubusercontent.com/DeepBlue-dot/store-ease/refs/heads/main/about/Screenshot.png) |
| ![](https://raw.githubusercontent.com/DeepBlue-dot/store-ease/refs/heads/main/about/Screenshot-6.png) | ![](https://raw.githubusercontent.com/DeepBlue-dot/store-ease/refs/heads/main/about/Screenshot-5.png) |
| ![](https://raw.githubusercontent.com/DeepBlue-dot/store-ease/refs/heads/main/about/ScreenShot%20Tool%20-20251111150311.png) | ![](https://raw.githubusercontent.com/DeepBlue-dot/store-ease/refs/heads/main/about/ScreenShot%20Tool%20-20251111150332.png) |
| ![](https://raw.githubusercontent.com/DeepBlue-dot/store-ease/refs/heads/main/about/Screenshot-2.png) | ![](https://raw.githubusercontent.com/DeepBlue-dot/store-ease/refs/heads/main/about/Screenshot-3.png) |
| ![](https://raw.githubusercontent.com/DeepBlue-dot/store-ease/refs/heads/main/about/Screenshot-4.png) | |

---

## 🏗️ Project Setup

### 1️⃣ Clone Repository
```bash
git clone https://github.com/DeepBlue-dot/store-ease.git
cd store-ease
````

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Setup Environment Variables

Create a `.env` file in the root directory with:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/storeease"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
MAILJET_API_KEY="your-mailjet-key"
MAILJET_SECRET_KEY="your-mailjet-secret"
```

### 4️⃣ Run Prisma Migrations

```bash
npx prisma migrate dev
```

### 5️⃣ Start the Development Server

```bash
npm run dev
```

Now open **[http://localhost:3000](http://localhost:3000)** 🚀

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -m "Added new feature"`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create a Pull Request

---

## 🧑‍💻 Author

**DeepBlue-dot**
🌐 [GitHub Profile](https://github.com/DeepBlue-dot)
💬 Open to feedback, improvements, and collaboration.

---

## 📜 License

This project is licensed under the **MIT License**.
See the [LICENSE](LICENSE) file for details.

