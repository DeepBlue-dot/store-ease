"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type ForgotPasswordFormValues = {
  email: string;
};

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormValues>();

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setLoading(true);
    setMessage(null);

    try {
      // Replace with your API call to send password reset email
      await new Promise((res) => setTimeout(res, 1000));
      setMessage("If this email exists, a password reset link has been sent.");
    } catch (err) {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6">
      <Card className="p-8 shadow-lg rounded-2xl w-full max-w-md">
        <CardContent className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 text-center">
            Forgot Password
          </h1>
          <p className="text-gray-600 text-center">
            Enter your email address and we’ll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-gray-800">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email", { required: "Email is required" })}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>

            <Button variant="outline" type="submit" className="w-full text-zinc-200" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>

          {message && (
            <p className="text-center text-green-600 font-medium">{message}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
