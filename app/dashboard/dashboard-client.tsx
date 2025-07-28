// Lines: 16
// Purpose: Client-side dashboard with modal state management
// REVIEW CHECKPOINT: Modal should open when Create Digest button clicked

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CreateDigestDialog } from '@/components/digest/CreateDigestDialog'
import { DeleteDigestModal } from '@/components/digest/DeleteDigestModal'
import { Icon } from '@/components/ui/icon'
import { AppHeader } from '@/components/ui/app-header'
import {
  BookOpen,
  Zap,
  Rocket,
  ClipboardList,
  Brain,
  Check,
  Clock,
  AlertTriangle,
  MailX,
  Search,
  Trash2,
  Network,
  Code,
  GitBranch,
  Calendar,
  PenTool
} from 'lucide-react'
import Link from 'next/link'
import type { DigestWithStatus } from '@/types/database'

interface DashboardClientProps {
  user: {
    email?: string;
  };
  digests: DigestWithStatus[];
}

export function DashboardClient({ user, digests }: DashboardClientProps) {
  const router = useRouter()
  const [currentDigests, setCurrentDigests] = useState(digests)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [digestToDelete, setDigestToDelete] = useState<DigestWithStatus | null>(null)

  // Auto-refresh for processing digests
  useEffect(() => {
    const hasProcessingDigests = currentDigests.some(
      digest => digest.status === 'pending' || digest.status === 'processing'
    )

    if (!hasProcessingDigests) return

    const interval = setInterval(() => {
      // Refresh the page to get updated digest statuses
      router.refresh()
    }, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [currentDigests, router])

  // Update current digests when props change
  useEffect(() => {
    setCurrentDigests(digests)
  }, [digests])

  // Filter and sort digests
  const filteredDigests = currentDigests
    .filter(digest => {
      // Search filter
      const matchesSearch = searchQuery === '' ||
        digest.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        digest.conversation_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        digest.processed_content?.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        digest.processed_content?.metadata?.domain?.toLowerCase().includes(searchQuery.toLowerCase())

      // Status filter
      const matchesStatus = statusFilter === 'all' || digest.status === statusFilter

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'title':
          return (a.title || a.conversation_title || '').localeCompare(b.title || b.conversation_title || '')
        default:
          return 0
      }
    })

  const handleDeleteClick = (digest: DigestWithStatus, event: React.MouseEvent) => {
    event.preventDefault(); // Prevent navigation
    event.stopPropagation();
    setDigestToDelete(digest);
    setDeleteModalOpen(true);
  };

  const handleDeleteSuccess = () => {
    if (digestToDelete) {
      // Remove the deleted digest from current state
      setCurrentDigests(prev => prev.filter(d => d.id !== digestToDelete.id))
      setDigestToDelete(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div>
        <AppHeader />

        {/* Page Header */}
        <div className="bg-bg-secondary">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-100">
                Dashboard
              </h2>
              <p className="text-sm text-gray-400">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Total Digests */}
            <Card>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-2">
                    Total Digests
                  </p>
                  <p className="text-4xl font-semibold text-gray-100">
                    {currentDigests.length}
                  </p>
                </div>
                <div className="w-16 h-16 bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center rounded-lg">
                  <Icon icon={BookOpen} size={32} className="text-accent-primary" />
                </div>
              </CardContent>
            </Card>

            {/* Total Processing Cost */}
            <Card>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-2">
                    Processing Cost
                  </p>
                  <p className="text-4xl font-semibold text-gray-100">
                    ${currentDigests.reduce((sum, digest) => sum + (digest.estimated_cost || 0), 0).toFixed(3)}
                  </p>
                </div>
                <div className="w-16 h-16 bg-accent-secondary/10 border border-accent-secondary/20 flex items-center justify-center rounded-lg">
                  <Icon icon={Zap} size={32} className="text-accent-secondary" />
                </div>
              </CardContent>
            </Card>

            {/* Total Tokens */}
            <Card>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-2">
                    Tokens Burned
                  </p>
                  <p className="text-4xl font-semibold text-gray-100">
                    {currentDigests.reduce((sum, digest) => {
                      const inputTokens = digest.input_tokens || 0;
                      const outputTokens = digest.output_tokens || 0;
                      return sum + inputTokens + outputTokens;
                    }, 0).toLocaleString()}
                  </p>
                </div>
                <div className="w-16 h-16 bg-accent-warning/10 border border-accent-warning/20 flex items-center justify-center rounded-lg">
                  <Icon icon={Zap} size={32} className="text-accent-warning" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Action Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-3xl font-semibold text-center text-gray-100">
                Create Digest
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-6">
                Paste an AI conversation link to create a structured summary with key insights and action items.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <CreateDigestDialog>
                  <Button
                    variant="default"
                    size="lg"
                    className="min-w-[200px]"
                  >
                    <Icon icon={Rocket} size={20} className="text-white" />
                    Create Digest
                  </Button>
                </CreateDigestDialog>

              </div>

              {/* Visualization Types */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 pt-8 border-t border-gray-700">
                <div className="text-center">
                  <div className="w-12 h-12 bg-accent-primary/10 border border-accent-primary/20 mx-auto mb-2 flex items-center justify-center rounded-lg">
                    <Icon icon={ClipboardList} size={24} strokeWidth={3} className="text-accent-primary" />
                  </div>
                  <p className="text-xs font-medium text-gray-200">
                    Executive Summary
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-accent-primary/10 border border-accent-primary/20 mx-auto mb-2 flex items-center justify-center rounded-lg">
                    <Icon icon={Network} size={24} strokeWidth={3} className="text-accent-primary" />
                  </div>
                  <p className="text-xs font-medium text-gray-200">
                    Knowledge Graph
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-accent-primary/10 border border-accent-primary/20 mx-auto mb-2 flex items-center justify-center rounded-lg">
                    <Icon icon={Code} size={24} strokeWidth={3} className="text-accent-primary" />
                  </div>
                  <p className="text-xs font-medium text-gray-200">
                    Code Organization
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-accent-primary/10 border border-accent-primary/20 mx-auto mb-2 flex items-center justify-center rounded-lg">
                    <Icon icon={Brain} size={24} strokeWidth={3} className="text-accent-primary" />
                  </div>
                  <p className="text-xs font-medium text-gray-200">
                    Mind Map
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-accent-primary/10 border border-accent-primary/20 mx-auto mb-2 flex items-center justify-center rounded-lg">
                    <Icon icon={Calendar} size={24} strokeWidth={3} className="text-accent-primary" />
                  </div>
                  <p className="text-xs font-medium text-gray-200">
                    Timeline/Gantt
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-accent-primary/10 border border-accent-primary/20 mx-auto mb-2 flex items-center justify-center rounded-lg">
                    <Icon icon={GitBranch} size={24} strokeWidth={3} className="text-accent-primary" />
                  </div>
                  <p className="text-xs font-medium text-gray-200">
                    Decision Tree
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-accent-primary/10 border border-accent-primary/20 mx-auto mb-2 flex items-center justify-center rounded-lg">
                    <Icon icon={PenTool} size={24} strokeWidth={3} className="text-accent-primary" />
                  </div>
                  <p className="text-xs font-medium text-gray-200">
                    Blog Post
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-100">
                Search & Filter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1">
                  <Input
                    placeholder="Search digests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className=""
                  />
                </div>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">
                      <div className="flex items-center gap-2">
                        <Icon icon={Check} size={16} strokeWidth={2.5} className="text-green-600" />
                        Completed
                      </div>
                    </SelectItem>
                    <SelectItem value="processing">
                      <div className="flex items-center gap-2">
                        <Icon icon={Clock} size={16} strokeWidth={2.5} className="text-orange-600" />
                        Processing
                      </div>
                    </SelectItem>
                    <SelectItem value="pending">
                      <div className="flex items-center gap-2">
                        <Icon icon={AlertTriangle} size={16} strokeWidth={2.5} className="text-red-600" />
                        Pending
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort Options */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Newest First" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="title">A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Digests Grid */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-100">
                Your Digests ({filteredDigests.length} of{' '}
                {currentDigests.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentDigests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-800 border border-gray-700 mx-auto mb-4 flex items-center justify-center rounded-lg">
                    <Icon icon={MailX} size={48} strokeWidth={3} className="text-gray-500" />
                  </div>
                  <p className="text-lg font-medium text-gray-400 mb-2">
                    No Digests Yet
                  </p>
                  <p className="text-sm text-gray-500 max-w-md mx-auto">
                    Create your first digest from an AI conversation link to get started.
                  </p>
                </div>
              ) : filteredDigests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-800 border border-gray-700 mx-auto mb-4 flex items-center justify-center rounded-lg">
                    <Icon icon={Search} size={48} strokeWidth={3} className="text-gray-500" />
                  </div>
                  <p className="text-lg font-medium text-gray-400 mb-2">
                    No Results Found
                  </p>
                  <p className="text-sm text-gray-500 max-w-md mx-auto">
                    Try adjusting your search terms or filters to find what
                    you&apos;re looking for.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                      setSortBy('newest');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDigests.map((digest) => (
                    <div key={digest.id} className="relative group">
                      <Link
                        href={`/digest/${digest.id}`}
                        className={
                          digest.status !== 'completed'
                            ? 'pointer-events-none'
                            : ''
                        }
                      >
                        <Card
                          className={`h-full flex flex-col transition-all duration-200 ${
                            digest.status === 'completed'
                              ? 'hover:border-accent-primary/50 cursor-pointer'
                              : digest.status === 'processing'
                                ? 'animate-pulse opacity-75'
                                : 'opacity-50'
                          }`}
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-lg font-semibold text-gray-100 line-clamp-2 flex-1 pr-2">
                                {digest.title || digest.conversation_title}
                              </CardTitle>
                              <Button
                                variant="default"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white p-2 h-8 w-8"
                                onClick={(e) => handleDeleteClick(digest, e)}
                                title="Delete digest"
                              >
                                <Icon icon={Trash2} size={16} strokeWidth={2.5} className="text-white" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="flex-1 flex flex-col">
                            <div className="space-y-3 flex-1">
                              {/* Summary Preview */}
                              {digest.processed_content?.summary && (
                                <p className="text-sm text-gray-300 line-clamp-3">
                                  {digest.processed_content.summary}
                                </p>
                              )}

                              {/* Metadata */}
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-1 bg-accent-primary text-white rounded-lg font-medium">
                                    {digest.source_platform}
                                  </span>

                                  {/* Status Badge */}
                                  <span
                                    className={`px-2 py-1 rounded-lg font-medium flex items-center gap-1 ${
                                      digest.status === 'completed'
                                        ? 'bg-green-500 text-white'
                                        : digest.status === 'processing'
                                          ? 'bg-orange-500 text-white'
                                          : 'bg-red-500 text-white'
                                    }`}
                                  >
                                    {digest.status === 'completed' ? (
                                      <Icon icon={Check} size={14} strokeWidth={2.5} className="text-white" />
                                    ) : digest.status === 'processing' ? (
                                      <Icon icon={Clock} size={14} strokeWidth={2.5} className="text-white" />
                                    ) : (
                                      <Icon icon={AlertTriangle} size={14} strokeWidth={2.5} className="text-white" />
                                    )}
                                    {digest.status}
                                  </span>

                                  {digest.processed_content?.metadata
                                    ?.domain && (
                                    <span className="px-2 py-1 bg-gray-800 text-gray-200 rounded-lg">
                                      {digest.processed_content.metadata.domain}
                                    </span>
                                  )}
                                </div>
                              </div>

                            </div>

                            {/* Stats */}
                            <div className="flex items-center justify-between text-xs text-gray-500 mt-auto pt-3">
                                <span>
                                  {new Date(
                                    digest.created_at
                                  ).toLocaleDateString()}
                                </span>
                                <div className="flex items-center gap-2">
                                  {digest.processed_content?.keyInsights
                                    ?.length > 0 && (
                                    <span>
                                      {
                                        digest.processed_content.keyInsights
                                          .length
                                      }{' '}
                                      insights
                                    </span>
                                  )}
                                  {digest.processed_content?.practicalTakeaways
                                    ?.length > 0 && (
                                    <span>
                                      {
                                        digest.processed_content
                                          .practicalTakeaways.length
                                      }{' '}
                                      actions
                                    </span>
                                  )}
                                </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Delete Modal */}
        {digestToDelete && (
          <DeleteDigestModal
            isOpen={deleteModalOpen}
            onClose={() => {
              setDeleteModalOpen(false);
              setDigestToDelete(null);
            }}
            digest={digestToDelete}
            onDeleteSuccess={handleDeleteSuccess}
          />
        )}
      </div>
    </div>
  );
}
