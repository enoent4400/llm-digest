"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Trash2 } from "lucide-react"

interface DeleteDigestModalProps {
  isOpen: boolean
  onClose: () => void
  digest: {
    id: string
    title?: string
    conversation_title?: string
  }
  onDeleteSuccess?: () => void
  redirectToDashboard?: boolean
}

export function DeleteDigestModal({
  isOpen,
  onClose,
  digest,
  onDeleteSuccess,
  redirectToDashboard = false
}: DeleteDigestModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)

    // Show loading toast
    const loadingToastId = toast.loading("Deleting digest...", {
      description: "Removing digest from your collection...",
      icon: <Icon icon={Trash2} size={16} strokeWidth={2.5} />,
    })

    try {
      const response = await fetch(`/api/digest/${digest.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete digest')
      }

      // Dismiss loading toast and show success
      toast.dismiss(loadingToastId)
      toast.success("Digest deleted successfully!", {
        description: "The digest has been permanently removed from your collection.",
        duration: 1000,
      })

      // Close modal
      onClose()

      // Call success callback or redirect
      if (redirectToDashboard) {
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      } else if (onDeleteSuccess) {
        onDeleteSuccess()
      }

    } catch (error) {
      // Dismiss loading toast and show error
      toast.dismiss(loadingToastId)
      toast.error("❌ Failed to delete digest", {
        description: error instanceof Error ? error.message : "Please try again or contact support.",
        duration: 5000,
      })
      console.error('Delete error:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const digestTitle = digest.title || digest.conversation_title || 'Untitled Digest'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-100 flex items-center gap-2">
            <Icon icon={Trash2} size={20} className="text-accent-error" />
            Delete Digest
          </DialogTitle>
          <DialogDescription className="text-base text-gray-400">
            This action cannot be undone. The digest will be permanently removed from your collection.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-accent-error/10 border border-accent-error/20 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-100 mb-2">
              You are about to delete:
            </h4>
            <p className="text-gray-300 italic">
              &quot;{digestTitle}&quot;
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Forever"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
