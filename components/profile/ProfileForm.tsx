"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useState, useEffect } from "react";
import { profileSchema } from "@/lib/validators/user/user";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { toast } from "sonner";
import Image from "next/image";
import { Loader2 } from "lucide-react";

type ProfileInput = z.infer<typeof profileSchema> & {
  image?: FileList;
};

interface ProfileFormProps {
  user: {
    id: string;
    name?: string | null;
    phone?: string | null;
    address?: string | null;
    image?: string | null;
  };
  onUpdate: (data: any) => void;
}

export default function ProfileForm({ user, onUpdate }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(user.image || null);

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name ?? "",
      phone: user.phone ?? "",
      address: user.address ?? "",
    },
  });

  const onSubmit = async (values: ProfileInput) => {
    try {
      setLoading(true);

      const formData = new FormData();
      if (values.name) formData.append("name", values.name);
      if (values.phone) formData.append("phone", values.phone);
      if (values.address) formData.append("address", values.address);
      if (values.image?.[0]) formData.append("image", values.image[0]);

      const res = await axios.patch("/api/users/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onUpdate(res.data);
      toast.success("✅ Profile updated successfully");
    } catch (err: any) {
      console.error("Profile update failed:", err);
      toast.error(err.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-lg mx-auto rounded-2xl shadow-md border border-gray-200">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">
          Edit Profile
        </CardTitle>
        <CardDescription className="text-sm text-gray-600">
          Update your personal information and profile picture
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* Profile Image Upload with Preview */}
            <Controller
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Image</FormLabel>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border border-gray-300 flex items-center justify-center">
                      {preview ? (
                        <Image
                          src={preview}
                          alt="Profile preview"
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <span className="text-gray-400 text-sm">No Image</span>
                      )}
                    </div>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          field.onChange(e.target.files);
                          if (e.target.files?.[0]) {
                            setPreview(URL.createObjectURL(e.target.files[0]));
                          }
                        }}
                        className="text-sm"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your name"
                      {...field}
                      className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Phone number"
                      {...field}
                      className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Address"
                      {...field}
                      className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Profile"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
