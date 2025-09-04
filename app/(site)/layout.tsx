// app/layout.tsx
import Footer from "@/components/common/user/Footer";
import Navbar from "@/components/common/user/NavBar";
import type { Metadata } from "next";


export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar/>
      <main className="p-6">{children}</main>
      <Footer/>
    </>
  );
}
