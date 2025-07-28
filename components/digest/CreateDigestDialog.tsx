"use client"

import { useState, useEffect, useRef } from "react"
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
import { Progress } from "@/components/ui/progress"

import { Icon } from "@/components/ui/icon"
import { PartyPopper, Rocket, } from "lucide-react"

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
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState("")
  const router = useRouter()
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const currentProgressRef = useRef(0)
  const messageIndexRef = useRef(0)

  const progressMessages = [
    "Analyzing conversation structure...",
    "Extracting key insights...",
    "Processing AI responses...",
    "Identifying important topics...",
    "Organizing conversation flow...",
    "Generating summary points...",
    "Creating digest structure...",
    "Applying final touches...",
    "Almost ready...",
  ]

  // Cleanup progress timer on unmount
  useEffect(() => {
    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current)
        progressTimerRef.current = null
      }
    }
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      claudeUrl: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    // Start progress indicator
    setProgress(0)
    setProgressMessage(progressMessages[0])
    currentProgressRef.current = 0
    messageIndexRef.current = 0

    // Simulate progress with random messages using refs
    progressTimerRef.current = setInterval(() => {
      currentProgressRef.current += Math.random() * 15 + 5 // Progress by 5-20% each time
      if (currentProgressRef.current >= 95) currentProgressRef.current = 95 // Cap at 95% until completion

      // Update message every 20-30% progress or if we've moved to next message
      if (currentProgressRef.current > (messageIndexRef.current + 1) * 10 && messageIndexRef.current < progressMessages.length - 1) {
        messageIndexRef.current++
        setProgressMessage(progressMessages[messageIndexRef.current])
      }

      setProgress(currentProgressRef.current)
    }, 800 + Math.random() * 400) // Random interval between 800-1200ms

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

      // Clear progress timer and complete progress
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current)
        progressTimerRef.current = null
      }
      currentProgressRef.current = 100
      setProgress(100)

      // Dismiss loading toast and show success
      toast.success("Digest created successfully!", {
        description: "Redirecting to your digest...",
        duration: 3000,
        icon: <Icon icon={PartyPopper} size={16} strokeWidth={2.5} className="text-white" />,
      })

      // Navigate to the digest page after a short delay
      router.push(`/digest/${digestData.digestId}`)

      // Close dialog and reset form
      setOpen(false)
      form.reset()

    } catch (error) {
      // Clear progress timer
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current)
        progressTimerRef.current = null
      }

      // Dismiss loading toast and show error
      toast.error("Failed to create digest", {
        description: error instanceof Error ? error.message : "Please try again or contact support.",
      })
    } finally {
      setIsSubmitting(false)
      setProgress(0)
      currentProgressRef.current = 0
      messageIndexRef.current = 0
      setProgressMessage("")
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
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500">
                    Make your conversation public, then paste the share link here.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isSubmitting && (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-gray-400 text-center animate-pulse">
                  {progressMessage}
                </p>
              </div>
            )}

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
