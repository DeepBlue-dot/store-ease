"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { useState } from "react"
import { profileSchema } from "@/lib/validators/user/user"
import type { z } from "zod"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import Image from "next/image"
import { Loader2 } from "lucide-react"

type ProfileInput = z.infer<typeof profileSchema> & {
  image?: FileList
}

interface ProfileFormProps {
  user: {
    id: string
    name?: string | null
    phone?: string | null
    address?: string | null
    image?: string | null
  }
  onUpdate: (data: any) => void
}

const ProfileForm = ({ user, onUpdate }: ProfileFormProps) => {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(user.image || null)

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name ?? "",
      phone: user.phone ?? "",
      address: user.address ?? "",
    },
  })

  const onSubmit = async (values: ProfileInput) => {
    try {
      setLoading(true)

      const formData = new FormData()
      if (values.name) formData.append("name", values.name)
      if (values.phone) formData.append("phone", values.phone)
      if (values.address) formData.append("address", values.address)
      if (values.image?.[0]) formData.append("image", values.image[0])

      const res = await axios.patch("/api/users/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      onUpdate(res.data)
      toast.success("✅ Profile updated successfully")
    } catch (err: any) {
      console.error("Profile update failed:", err)
      toast.error(err.response?.data?.error || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="shadow-lg rounded-3xl border-0 bg-gradient-to-br from-blue-50 to-white">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 text-sm">✏️</span>
          </div>
          Edit Profile
        </CardTitle>
        <CardDescription className="text-slate-600 leading-relaxed">
          Update your personal information and profile picture
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Image Upload with Preview */}
            <Controller
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">Profile Image</FormLabel>
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-lg flex items-center justify-center">
                      {preview ? (
                        <Image
                          src={preview || "/placeholder.svg"}
                          alt="Profile preview"
                          width={80}
                          height={80}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <span className="text-slate-400 text-xs">No Image</span>
                      )}
                    </div>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          field.onChange(e.target.files)
                          if (e.target.files?.[0]) {
                            setPreview(URL.createObjectURL(e.target.files[0]))
                          }
                        }}
                        className="text-sm rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-400"
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
                  <FormLabel className="text-slate-700 font-medium">Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your name"
                      {...field}
                      className="rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-400 h-12"
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
                  <FormLabel className="text-slate-700 font-medium">Phone</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Phone number"
                      {...field}
                      className="rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-400 h-12"
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
                  <FormLabel className="text-slate-700 font-medium">Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Address"
                      {...field}
                      className="rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-400 h-12"
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
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl h-12 font-medium shadow-lg"
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
  )
}

export default ProfileForm
