"use client";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

type SignInFormValues = {
  email: string;
  password: string;
};

export default function SignInForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>();

  const onSubmit = async (data: SignInFormValues) => {
    // prevent default redirect
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false, // important!
    });

    if (result?.ok) {
      // fetch session to get user role
      const session = await fetch("/api/auth/session").then((res) => res.json());
      if (session?.user?.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/"); // CUSTOMER or default
      }
    } else if (result?.error) {
      alert(result.error); // handle login errors
    }
  };

  const handleGoogleSignIn = async () => {
    const result = await signIn("google", { redirect: false });
    if (result?.ok) {
      const session = await fetch("/api/auth/session").then((res) => res.json());
      if (session?.user?.role === "ADMIN") router.push("/admin");
      else router.push("/");
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Sign In
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="my-6 border-t border-gray-300"></div>

      <button
        onClick={handleGoogleSignIn}
        className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition"
      >
        Continue with Google
      </button>
    </div>
  );
}
