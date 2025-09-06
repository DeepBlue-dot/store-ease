"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

type SignInFormValues = {
  email: string;
  password: string;
};

export default function SignInForm() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } =
    useForm<SignInFormValues>();

  // Credentials login
  const handleCredentialsSignIn = async (data: SignInFormValues) => {
    setLoading(true);
    setErrorMessage(null);

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: true,
      callbackUrl: "/admin", // fallback if no middleware redirect
    });

    if (result?.error) {
      setErrorMessage(result.error || "Login failed");
    }

    setLoading(false);
  };

  // Google login
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);

    await signIn("google", {
      redirect: true,
      callbackUrl: "/",
    });

    setLoading(false);
  };

  return (
    <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md mx-auto">
      {/* Header */}
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
        Welcome Back
      </h1>
      <p className="text-center text-gray-500 mb-6">
        Sign in to continue to your account
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit(handleCredentialsSignIn)} className="space-y-4">
        {/* Email */}
        <div>
          <input
            type="email"
            placeholder="Email"
            className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition p-3 rounded-lg"
            {...register("email", { required: "Email is required" })}
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <input
            type="password"
            placeholder="Password"
            className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition p-3 rounded-lg"
            {...register("password", { required: "Password is required" })}
          />
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Error Message */}
        {errorMessage && (
          <p className="text-red-600 mt-2 text-center font-medium">{errorMessage}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center">
        <hr className="flex-1 border-gray-300" />
        <span className="px-2 text-gray-500 text-sm">or</span>
        <hr className="flex-1 border-gray-300" />
      </div>

      {/* Google Sign-In */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
      >
        <img
          src="https://developers.google.com/identity/images/g-logo.png"
          alt="Google logo"
          className="w-5 h-5"
        />
        {loading ? "Signing in..." : "Continue with Google"}
      </button>

      {/* Links */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600 gap-2">
        <Link
          href="/auth/register"
          className="hover:text-blue-600 transition"
        >
          Don’t have an account? Register
        </Link>
        <Link
          href="/auth/forgot-password"
          className="hover:text-blue-600 transition"
        >
          Forgot your password?
        </Link>
      </div>
    </div>
  );
}
