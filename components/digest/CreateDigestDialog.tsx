"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { RotateCcw, PartyPopper, Rocket, } from "lucide-react"

const formSchema = z.object({
  claudeUrl: z.string()
    .url("Please enter a valid URL")
    .refine((url) => url.includes("claude.ai") || url.includes("chatgpt.com") || url.includes("gemini") || url.includes("copilot.microsoft.com") || url.includes("grok"), {
      message: "Please enter a valid AI chat share link",
    }),
})

interface CreateDigestDialogProps {
  children: React.ReactNode
}

export function CreateDigestDialog({ children }: CreateDigestDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      claudeUrl: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    // Show loading toast
    const loadingToastId = toast.loading("Creating digest...", {
      description: "This will take a few seconds...",
      icon: <Icon icon={RotateCcw} size={16} strokeWidth={2.5} className="animate-spin text-black dark:text-white" />,
    })

    try {
      // Create digest directly from URL using the unified API
      const digestResponse = await fetch('/api/digest/create-from-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: values.claudeUrl })
      })

      if (!digestResponse.ok) {
        const errorData = await digestResponse.json()
        throw new Error(errorData.error || 'Failed to create digest')
      }

      const digestData = await digestResponse.json()

      // Dismiss loading toast and show success
      toast.dismiss(loadingToastId)
      toast.success("Digest created successfully!", {
        description: "Redirecting to your digest...",
        duration: 3000,
        icon: <Icon icon={PartyPopper} size={16} strokeWidth={2.5} className="text-white" />,
      })

      // Navigate to the digest page after a short delay
      setTimeout(() => {
        router.push(`/digest/${digestData.digestId}`)
      }, 1000)

      // Close dialog and reset form
      setOpen(false)
      form.reset()

    } catch (error) {
      // Dismiss loading toast and show error
      toast.dismiss(loadingToastId)
      toast.error("Failed to create digest", {
        description: error instanceof Error ? error.message : "Please try again or contact support.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-100 flex items-center gap-2">
            <Icon icon={Rocket} size={24} className="text-accent-primary" />
            Create Digest
          </DialogTitle>
          <DialogDescription className="text-base text-gray-400">
            Paste an AI chat share link to create a digest.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="claudeUrl"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="https://claude.ai/share/... or chatgpt.com/share/..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500">
                    Make your conversation public, then paste the share link here.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Digest"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
