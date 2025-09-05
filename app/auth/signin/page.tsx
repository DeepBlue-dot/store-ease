import SignInForm from "@/components/forms/SignInForm";
import { Suspense } from "react";

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6">
      <Suspense>
        <SignInForm />
      </Suspense>
    </div>
  );
}
