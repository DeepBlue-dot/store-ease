"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { signIn } from "next-auth/react";

type SignInFormValues = {
  email: string;
  password: string;
};

export default function SignInForm() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<SignInFormValues>();

  // Credentials login
  const handleCredentialsSignIn = async (data: SignInFormValues) => {
    setLoading(true);
    setErrorMessage(null);

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: true, // let middleware handle the redirect
      callbackUrl: "/", // fallback if no middleware redirect
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
      redirect: true, // middleware handles role-based redirect
      callbackUrl: "/", // fallback
    });

    setLoading(false);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Sign In</h1>

      <form onSubmit={handleSubmit(handleCredentialsSignIn)} className="space-y-4">
        {/* Email */}
        <div>
          <input
            type="email"
            placeholder="Email"
            className="w-full border p-2 rounded"
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
            className="w-full border p-2 rounded"
            {...register("password", { required: "Password is required" })}
          />
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Error Message */}
        {errorMessage && (
          <p className="text-red-600 mt-2 text-center">{errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="my-6 border-t border-gray-300"></div>

      {/* Google Sign-In */}
      <button
        type="button" // important! prevents form submit
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <img
          src="https://developers.google.com/identity/images/g-logo.png"
          alt="Google logo"
          className="w-5 h-5"
        />
        {loading ? "Signing in..." : "Continue with Google"}
      </button>
    </div>
  );
}
