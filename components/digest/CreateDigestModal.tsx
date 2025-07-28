import React, { useState } from 'react';
import { ExecutiveSummary } from '@/components/visualizations/executive-summary';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { Icon } from '@/components/ui/icon';
import { PartyPopper, RotateCcw } from 'lucide-react';

interface CreateDigestModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
}

export function CreateDigestModal({ isOpen, onClose, isLoading }: CreateDigestModalProps) {
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [digestResult, setDigestResult] = useState<any>(null);

  const handleSubmit = async () => {
    // Basic URL validation - check for common AI chat platforms
    const validPlatforms = ['claude.ai', 'chatgpt.com', 'gemini.google.com', 'copilot.microsoft.com', 'grok.com'];
    const isValidUrl = validPlatforms.some(platform => url.includes(platform));
    
    if (!isValidUrl) {
      setError('Please enter a valid AI chat share link (Claude, ChatGPT, Gemini, Copilot, or Grok)');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Use the unified create-from-url endpoint
      const response = await fetch('/api/digest/create-from-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create digest');
      }

      const digestData = await response.json();

      // Success - show result
      setDigestResult(digestData);
      setSuccess(true);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create digest');
    }

    setIsSubmitting(false);
  };

  const handleClose = () => {
    setSuccess(false);
    setUrl('');
    setDigestResult(null);
    setError('');
    onClose();
  };

  const handleCreateAnother = () => {
    setSuccess(false);
    setUrl('');
    setDigestResult(null);
    setError('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`max-w-4xl ${success ? 'max-h-[90vh]' : 'max-h-[80vh]'} overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-100">
            🚀 Create Digest
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="space-y-6">
            <Alert variant="success">
              <div className="text-center flex items-center justify-center gap-2">
                <Icon icon={PartyPopper} size={20} className="text-accent-success" />
                Digest created successfully!
              </div>
            </Alert>

            {/* Show the actual ExecutiveSummary component */}
            {digestResult && (
              <div className="max-h-[60vh] overflow-y-auto">
                <ExecutiveSummary
                  digest={JSON.parse(digestResult.result.digest)}
                  apiResponse={digestResult.result}
                  showMetadata={true}
                />
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <Button
                variant="secondary"
                onClick={handleCreateAnother}
              >
                Create Another
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  handleClose();
                  window.location.reload(); // Refresh to show new digest
                }}
              >
                Done
              </Button>
            </div>
          </div>
        ) : isLoading || isSubmitting ? (
          <div className="py-8 text-center space-y-4">
            <div className="text-lg font-semibold text-gray-100">
              <div className="flex items-center justify-center gap-2">
                {isSubmitting && <Icon icon={RotateCcw} size={20} className="animate-spin" />}
                {isSubmitting ? 'Creating your digest...' : 'Loading...'}
              </div>
            </div>
            {isSubmitting && (
              <div className="text-sm text-gray-400">
                This will take a few seconds...
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <p className="text-lg text-gray-300">
                Share your AI conversation publicly and paste the link to transform it into a beautiful, shareable digest. Works with Claude, ChatGPT, Gemini, Copilot, and Grok.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="url" className="text-sm font-medium text-gray-300">
                AI Chat Share Link
              </Label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://claude.ai/share/... or chatgpt.com/share/..."
                className={error ? 'border-accent-error' : ''}
              />
              <p className="text-xs text-gray-500">
                First make your conversation public using the share button, then paste the share link here. Supports Claude, ChatGPT, Gemini, Copilot, and Grok.
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <div className="text-sm">
                  {error}
                </div>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleSubmit}
                disabled={!url || isSubmitting}
              >
                Create Digest
              </Button>
              <Button
                variant="secondary"
                onClick={handleClose}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}