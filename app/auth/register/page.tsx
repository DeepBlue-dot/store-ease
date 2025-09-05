"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { registerSchema, RegisterInput } from "@/lib/validators/user";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    setServerError(null);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Something went wrong");
      }

      reset();

      // ✅ Let NextAuth handle redirect to login and then role-based routing
      signIn("credentials", {
        redirect: true,
        callbackUrl: "/auth/signin", // user will land here first
      });
    } catch (err: any) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Register</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block font-medium">Name</label>
          <input
            {...register("name")}
            className="w-full border rounded px-3 py-2"
            placeholder="John Doe"
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block font-medium">Email</label>
          <input
            {...register("email")}
            type="email"
            className="w-full border rounded px-3 py-2"
            placeholder="example@email.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block font-medium">Password</label>
          <input
            {...register("password")}
            type="password"
            className="w-full border rounded px-3 py-2"
            placeholder="********"
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block font-medium">Phone</label>
          <input
            {...register("phone")}
            className="w-full border rounded px-3 py-2"
            placeholder="+123456789"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm">{errors.phone.message}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block font-medium">Address</label>
          <input
            {...register("address")}
            className="w-full border rounded px-3 py-2"
            placeholder="123 Main St"
          />
          {errors.address && (
            <p className="text-red-500 text-sm">{errors.address.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center">
        <hr className="flex-1 border-gray-300" />
        <span className="px-2 text-gray-500 text-sm">or</span>
        <hr className="flex-1 border-gray-300" />
      </div>

      {/* Google Auth */}
      <button
        onClick={() => signIn("google", { callbackUrl: "/" })}
        className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded hover:bg-gray-100"
      >
        <img
          src="https://developers.google.com/identity/images/g-logo.png"
          alt="Google logo"
          className="w-5 h-5"
        />
        Continue with Google
      </button>

      {/* Server feedback */}
      {serverError && (
        <p className="mt-4 text-red-600 font-medium">{serverError}</p>
      )}
    </div>
  );
}
