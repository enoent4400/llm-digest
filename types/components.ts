// React component prop types and UI-related interfaces
// Centralized definitions for all component props and UI states

import type { ReactNode } from 'react';
import type { DigestRecord } from './database';
import type { ExecutiveSummaryContent } from './digest';
import type { DigestResult } from '@/lib/ai';

// === Modal and Dialog Component Types ===

export interface CreateDigestDialogProps {
  children: ReactNode;
}

export interface DeleteDigestModalProps {
  isOpen: boolean;
  onClose: () => void;
  digest: DigestRecord | null;
  onConfirm: (digestId: string) => void;
  isDeleting?: boolean;
}

export interface RegenerateDigestModalProps {
  isOpen: boolean;
  onClose: () => void;
  digest: DigestRecord | null;
  onConfirm: (digestId: string) => void;
  isRegenerating?: boolean;
}

// === Visualization Component Types ===

export interface ExecutiveSummaryProps {
  digest: ExecutiveSummaryContent;
  apiResponse?: DigestResult;
  databaseDigest?: DigestRecord;
  showMetadata?: boolean;
  className?: string;
}

export interface ActionPlanProps {
  digest: any; // Will be ActionPlanContent when implemented
  showMetadata?: boolean;
  className?: string;
}

export interface FAQProps {
  digest: any; // Will be FAQContent when implemented
  showMetadata?: boolean;
  className?: string;
}

export interface MindMapProps {
  digest: any; // Will be MindMapContent when implemented
  showMetadata?: boolean;
  className?: string;
}

// === Dashboard Component Types ===

export interface DashboardClientProps {
  user: {
    id: string;
    email?: string;
    created_at?: string;
  };
  digests: DigestRecord[];
}

export interface DigestCardProps {
  digest: DigestRecord;
  onView: (digestId: string) => void;
  onDelete: (digest: DigestRecord) => void;
  onRegenerate: (digest: DigestRecord) => void;
  onShare?: (digest: DigestRecord) => void;
}

export interface DigestGridProps {
  digests: DigestRecord[];
  isLoading?: boolean;
  onDigestAction: (action: 'view' | 'delete' | 'regenerate' | 'share', digest: DigestRecord) => void;
}

// === Form Component Types ===

// Form data types moved to forms.ts to avoid conflicts

export interface DigestFiltersState {
  searchQuery: string;
  statusFilter: 'all' | 'completed' | 'processing' | 'pending' | 'failed';
  sortBy: 'newest' | 'oldest' | 'title';
  platformFilter?: 'all' | 'claude' | 'chatgpt' | 'gemini' | 'perplexity';
  formatFilter?: 'all' | 'executive-summary' | 'action-plan' | 'faq' | 'mind-map' | 'knowledge-graph' | 'code-organization' | 'gantt-chart' | 'decision-tree' | 'blog-post';
}

export interface SearchFiltersProps {
  filters: DigestFiltersState;
  onFiltersChange: (filters: Partial<DigestFiltersState>) => void;
  totalCount: number;
  isLoading?: boolean;
}

// === Page Component Types ===

export interface DigestPageProps {
  params: Promise<{
    id: string;
  }>;
}

export interface DashboardPageProps {
  searchParams?: {
    page?: string;
    search?: string;
    status?: string;
    sort?: string;
  };
}

// === Auth Component Types ===

// Auth form data types moved to forms.ts to avoid conflicts

export interface AuthFormProps {
  isLoading?: boolean;
  onSubmit: (data: any) => void; // Use any to avoid circular imports
  error?: string;
  mode: 'login' | 'signup';
}

// === Layout Component Types ===

export interface NavbarProps {
  user?: {
    email?: string;
  } | null;
  onSignOut?: () => void;
}

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user?: {
    email?: string;
  } | null;
}

export interface FooterProps {
  className?: string;
}

// === Theme and UI Component Types ===

export interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: 'light' | 'dark' | 'system';
  storageKey?: string;
}

export interface ThemeToggleProps {
  className?: string;
}

// === Loading and Error Component Types ===

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

export interface ErrorDisplayProps {
  error: string | Error;
  retry?: () => void;
  className?: string;
}

// === Shared UI Component Types ===

export interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export interface CardProps {
  className?: string;
  children: ReactNode;
}

export interface InputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
  error?: string;
}

// === State Management Types ===

export interface DigestState {
  digests: DigestRecord[];
  currentDigest: DigestRecord | null;
  isLoading: boolean;
  error: string | null;
  filters: DigestFiltersState;
}

export interface UIState {
  modals: {
    createDigest: boolean;
    deleteDigest: boolean;
    regenerateDigest: boolean;
  };
  sidebar: {
    isOpen: boolean;
  };
  theme: 'light' | 'dark' | 'system';
}

// === Event Handler Types ===

export type DigestActionHandler = (action: 'view' | 'delete' | 'regenerate' | 'share', digest: DigestRecord) => void;
export type ModalHandler = (isOpen: boolean) => void;
export type FilterChangeHandler = (filters: Partial<DigestFiltersState>) => void;
