import SignInForm from "@/components/forms/SignInForm";
import { Suspense } from "react";

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
