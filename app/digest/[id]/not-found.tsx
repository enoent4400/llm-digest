import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { HelpCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="max-w-md mx-auto">
        <CardContent className="text-center py-12">
          <div className="w-24 h-24 bg-gray-800 border border-gray-700 mx-auto mb-4 flex items-center justify-center rounded-lg">
            <Icon icon={HelpCircle} size={48} className="text-gray-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-100 mb-2">
            Digest Not Found
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            The digest you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
          </p>
          <Link href="/dashboard">
            <Button variant="default">
              ← Back to Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}