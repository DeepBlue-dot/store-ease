"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type SignInFormValues = {
  email: string;
  password: string;
};

export default function SignInForm() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } =
    useForm<SignInFormValues>();

  const handleCredentialsSignIn = async (data: SignInFormValues) => {
    setLoading(true);
    setErrorMessage(null);

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: true,
      callbackUrl: "/admin",
    });

    if (result?.error) {
      setErrorMessage(result.error || "Login failed");
    }

    setLoading(false);
  };

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
    <Card className="w-full max-w-md mx-auto shadow-xl rounded-2xl">
      <CardContent className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 text-sm">
            Sign in to continue to your account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleCredentialsSignIn)} className="space-y-4 text-gray-800">
          {/* Email */}
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              {...register("email", { required: "Email is required" })}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="********"
              {...register("password", { required: "Password is required" })}
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <p className="text-red-600 text-center font-medium">{errorMessage}</p>
          )}

          {/* Submit */}
          <Button variant="outline" type="submit" className="w-full text-zinc-200" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-2 my-4">
          <hr className="flex-1 border-gray-300" />
          <span className="text-gray-500 text-sm">or</span>
          <hr className="flex-1 border-gray-300" />
        </div>

        {/* Google Sign-In */}
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google logo"
            className="w-5 h-5"
          />
          {loading ? "Signing in..." : "Continue with Google"}
        </Button>

        {/* Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600 gap-2 mt-4">
          <Link href="/auth/register" className="hover:text-blue-600 transition">
            Don’t have an account? Register
          </Link>
          <Link href="/auth/forgot-password" className="hover:text-blue-600 transition">
            Forgot your password?
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
