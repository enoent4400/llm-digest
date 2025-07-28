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
import { RotateCcw, Sparkles, AlertTriangle } from "lucide-react"

interface RegenerateDigestModalProps {
  isOpen: boolean
  onClose: () => void
  digest: {
    id: string
    title?: string
    conversation_title?: string
    source_url?: string
    estimated_cost?: number
    conversation_fingerprint?: string
    raw_content?: {
      messages?: unknown[];
      [key: string]: unknown;
    }
  }
  onRegenerateSuccess?: () => void
}

export function RegenerateDigestModal({ 
  isOpen, 
  onClose, 
  digest, 
  onRegenerateSuccess
}: RegenerateDigestModalProps) {
  const [isRegenerating, setIsRegenerating] = useState(false)
  const router = useRouter()

  const handleRegenerate = async () => {
    setIsRegenerating(true)
    
    // Show loading toast
    const loadingToastId = toast.loading("Regenerating digest...", {
      description: "Re-processing with latest AI models...",
      icon: <Icon icon={RotateCcw} size={16} strokeWidth={2.5} className="animate-spin" />,
    })

    try {
      // Use the stored raw_content if available, otherwise show error
      let conversation;
      
      if (digest.raw_content && digest.raw_content.messages && digest.raw_content.messages.length > 0) {
        // Use the original conversation data
        conversation = digest.raw_content;
        console.log('Using stored raw_content for regeneration:', conversation);
      } else {
        // Cannot regenerate without original conversation data
        throw new Error('Cannot regenerate digest: Original conversation data is not available. This digest was created before we started storing raw conversation data.');
      }

      const response = await fetch('/api/digest/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation: conversation,
          options: {
            regenerate: true,
            existingDigestId: digest.id,
            visualizationType: 'summary'
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to regenerate digest')
      }

      const result = await response.json()

      // Dismiss loading toast and show success
      toast.dismiss(loadingToastId)
      toast.success("Digest regenerated successfully!", {
        description: `Updated with ${result.result?.modelUsed} • Cost: $${result.result?.cost?.toFixed(4) || '0.0000'}`,
        duration: 4000,
        icon: <Icon icon={Sparkles} size={16} strokeWidth={2.5} />,
      })

      // Close modal
      onClose()

      // Call success callback or refresh page
      if (onRegenerateSuccess) {
        onRegenerateSuccess()
      } else {
        // Refresh the page to show updated content
        router.refresh()
      }

    } catch (error) {
      // Dismiss loading toast and show error
      toast.dismiss(loadingToastId)
      toast.error("❌ Failed to regenerate digest", {
        description: error instanceof Error ? error.message : "Please try again or contact support.",
        duration: 5000,
      })
      console.error('Regenerate error:', error)
    } finally {
      setIsRegenerating(false)
    }
  }

  const digestTitle = digest.title || digest.conversation_title || 'Untitled Digest'
  const estimatedCost = digest.estimated_cost || 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-100 flex items-center gap-2">
            <Icon icon={RotateCcw} size={20} className="text-accent-primary" />
            Regenerate Digest
          </DialogTitle>
          <DialogDescription className="text-base text-gray-400">
            Re-process this conversation with the latest AI models to potentially get improved insights and analysis.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-bg-secondary border border-gray-800 p-4 rounded-lg mb-4">
            <h4 className="font-semibold text-gray-100 mb-2">
              You are about to regenerate:
            </h4>
            <p className="text-gray-300 italic mb-3">
              &quot;{digestTitle}&quot;
            </p>
            <div className="text-sm text-gray-400">
              <p>• Original cost: <span className="font-medium">${estimatedCost.toFixed(4)}</span></p>
              <p>• New processing will incur additional costs</p>
              <p>• Latest AI models may provide better insights</p>
            </div>
          </div>

          {!digest.raw_content || !digest.raw_content.messages || digest.raw_content.messages.length === 0 ? (
            <div className="bg-accent-error/10 border border-accent-error/20 p-3 rounded-lg">
              <p className="text-sm text-accent-error">
                ❌ <strong>Cannot Regenerate:</strong> This digest was created before we started storing original conversation data. Regeneration is only available for newly created digests.
              </p>
            </div>
          ) : (
            <div className="bg-accent-warning/10 border border-accent-warning/20 p-3 rounded-lg">
              <p className="text-sm text-accent-warning">
                <div className="flex items-start gap-2">
                  <Icon icon={AlertTriangle} size={16} className="text-accent-warning mt-0.5 flex-shrink-0" />
                  <span><strong>Note:</strong> This will replace the current digest content with newly generated analysis using the latest AI models.</span>
                </div>
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isRegenerating}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={handleRegenerate}
            disabled={isRegenerating || !digest.raw_content || !digest.raw_content.messages || digest.raw_content.messages.length === 0}
          >
            <div className="flex items-center gap-2">
              {isRegenerating ? (
                <Icon icon={RotateCcw} size={16} className="animate-spin" />
              ) : (
                <Icon icon={RotateCcw} size={16} />
              )}
              {isRegenerating ? "Regenerating..." : "Regenerate"}
            </div>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}