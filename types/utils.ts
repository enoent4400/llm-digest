// Utility types and helper interfaces
// Common utility types used across the application

// === Pagination Types ===

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// === Sort and Filter Types ===

export type SortOrder = 'asc' | 'desc';

export interface SortConfig<T extends string = string> {
  field: T;
  direction: SortOrder;
}

export interface FilterConfig<T> {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like' | 'ilike';
  value: T;
}

export interface QueryParams <T> {
  filters?: FilterConfig<T>[];
  sort?: SortConfig[];
  pagination?: PaginationParams;
  search?: string;
}

// === Date and Time Types ===

export interface DateRange {
  start: Date | string;
  end: Date | string;
}

export interface TimeFrame {
  label: string;
  value: string;
  days: number;
}

export type DateFormat = 'ISO' | 'short' | 'medium' | 'long' | 'relative';

// === Search Types ===

export interface SearchConfig {
  query: string;
  fields: string[];
  fuzzy?: boolean;
  maxResults?: number;
  threshold?: number;
}

export interface SearchResult<T> {
  item: T;
  score: number;
  matches: Array<{
    field: string;
    value: string;
    indices: [number, number][];
  }>;
}

export interface SearchResponse<T> {
  results: SearchResult<T>[];
  total: number;
  query: string;
  processingTime: number;
}

// === Cache Types ===

export interface CacheEntry<T> {
  key: string;
  value: T;
  createdAt: number;
  expiresAt?: number;
  tags?: string[];
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
  keys: number;
}

// === File and Upload Types ===

export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  url?: string;
}

export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  extension: string;
}

export type FileType = 'image' | 'document' | 'text' | 'video' | 'audio' | 'other';

// === Environment and Configuration Types ===

export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  NEXT_PUBLIC_APP_URL: string;
  // Removed Supabase environment variables
  POCKETBASE_URL?: string;
  DATABASE_URL?: string;
  OPENROUTER_API_KEY?: string;
}

export interface FeatureFlags {
  enableAnalytics: boolean;
  enableCaching: boolean;
  enableExperimental: boolean;
  enableDebugMode: boolean;
  enableBetaFeatures: boolean;
}

// === API Status and Health Types ===

export interface ServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  latency?: number;
  lastCheck: string;
  error?: string;
}

export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'down';
  timestamp: string;
  services: ServiceStatus[];
  version: string;
  uptime: number;
}

// === Performance and Metrics Types ===

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime: number;
  memoryUsage: number;
  bundleSize: number;
}

export interface UsageMetrics {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  totalDigests: number;
  averageProcessingTime: number;
  cacheHitRate: number;
}

// === Notification Types ===

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationConfig {
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface NotificationState {
  notifications: Array<NotificationConfig & { id: string; timestamp: number }>;
}

// === Theme and Styling Types ===

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  mode: ThemeMode;
  primaryColor: string;
  accentColor: string;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  fontFamily: 'default' | 'mono' | 'serif';
}

// === Validation and Error Types ===

export interface ValidationRule<T> {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: T) => string | null;
  message?: string;
}

export interface FieldValidation <T> {
  field: string;
  rules: ValidationRule <T>[];
}

export type ValidationErrors<T> = Partial<Record<keyof T, string>>;

// === State Management Types ===

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastFetch?: number;
}

export interface OptimisticUpdate<T> {
  id: string;
  action: 'create' | 'update' | 'delete';
  data: T;
  timestamp: number;
}

// === Routing Types ===

export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  exact?: boolean;
  protected?: boolean;
  roles?: string[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

// === Utility Type Helpers ===

// Make specific properties optional
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Make specific properties required
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Deep partial (makes all nested properties optional)
export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

// Extract array element type
export type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

// Create a union of all possible paths in an object
export type Paths<T> = T extends object ? {
  [K in keyof T]: K extends string ? K | `${K}.${Paths<T[K]>}` : never
}[keyof T] : never;

// Get the type of a nested property by path
export type PathValue<T, P extends Paths<T>> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? Rest extends Paths<T[K]>
      ? PathValue<T[K], Rest>
      : never
    : never
  : P extends keyof T
    ? T[P]
    : never;

// Exclude null and undefined
export type NonNullable<T> = T extends null | undefined ? never : T;

// Function type helpers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AsyncFunction<Args extends any[] = any[], Return = any> = (...args: Args) => Promise<Return>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SyncFunction<Args extends any[] = any[], Return = any> = (...args: Args) => Return;
