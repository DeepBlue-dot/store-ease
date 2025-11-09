import { Suspense } from "react";
import ShopClient from "@/components/shop/ShopClient";

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading shop...</div>}>
      <ShopClient />
    </Suspense>
  );
}
