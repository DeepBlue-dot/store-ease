"use client"

import { useForm } from "react-hook-form"
import axios from "axios"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { z } from "zod"
import { toast } from "sonner"
import { useState } from "react"
import { Loader2 } from "lucide-react"

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
})

function PasswordForm() {
  const [loading, setLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "" },
  })

  async function onSubmit(values: any) {
    try {
      setLoading(true)
      await axios.patch("/api/users/me/password", values)
      form.reset()
      toast.success("✅ Password updated successfully")
    } catch (error: any) {
      console.error(error)
      toast.error(error.response?.data?.error || "Failed to update password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="shadow-lg rounded-3xl border-0 bg-gradient-to-br from-red-50 to-white">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-600 text-sm">🔒</span>
          </div>
          Change Password
        </CardTitle>
        <CardDescription className="text-slate-600 leading-relaxed">
          Ensure your account is using a strong, unique password to stay secure.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="currentPassword"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">Current Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter current password"
                      className="rounded-xl border-slate-200 focus:border-red-400 focus:ring-red-400 h-12"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="newPassword"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">New Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter new password"
                      className="rounded-xl border-slate-200 focus:border-red-400 focus:ring-red-400 h-12"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl h-12 font-medium shadow-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default PasswordForm
