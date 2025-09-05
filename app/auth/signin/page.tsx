"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

type SignInFormValues = {
  email: string;
  password: string;
};

export default function SignInPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // 🚀 Redirect after login
  useEffect(() => {
    if (session?.user) {
      if (session.user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    }
  }, [session, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>();

  const onSubmit = async (data: SignInFormValues) => {
    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false, // prevent auto redirect
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Sign In
        </h1>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              className="w-full border p-2 rounded"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              className="w-full border p-2 rounded"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 border-t border-gray-300"></div>

        {/* Google Sign-In */}
        <button
          onClick={() => signIn("google", { redirect: false })}
          className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition"
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}
