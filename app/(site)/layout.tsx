// app/layout.tsx
import { Footer } from "@/components/common/user/Footer";
import {Navbar} from "@/components/common/user/NavBar";


export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar/>
      <main>{children}</main>
      <Footer/>
    </>
  );
}
