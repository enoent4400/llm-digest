// Form validation and input types
// Centralized definitions for all form-related types and validation schemas

import { z } from 'zod';

// === Form Data Types ===

export interface ClaudeUrlFormData {
  claudeUrl: string;
}

export interface RawTextFormData {
  rawText: string;
  platform?: string;
  title?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ProfileFormData {
  email: string;
  name?: string;
  avatar?: string;
}

export interface PreferencesFormData {
  defaultFormat: 'executive-summary' | 'action-plan' | 'faq' | 'mind-map' | 'code-organization' | 'blog-post';
  notifications: {
    digestComplete: boolean;
    weeklyDigest: boolean;
    securityAlerts: boolean;
  };
  privacy: {
    shareAnalytics: boolean;
    publicProfile: boolean;
  };
}

// === Validation Schemas ===

export const claudeUrlSchema = z.object({
  claudeUrl: z
    .string()
    .min(1, 'Claude URL is required')
    .url('Please enter a valid URL')
    .refine(
      (url) => url.includes('claude.ai') && url.includes('/share/'),
      'Please enter a valid Claude.ai share link'
    ),
});

export const rawTextSchema = z.object({
  rawText: z
    .string()
    .min(50, 'Please provide at least 50 characters of conversation text')
    .max(50000, 'Text is too long (max 50,000 characters)'),
  platform: z.string().optional(),
  title: z.string().optional(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

export const signupSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const profileSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  name: z.string().optional(),
  avatar: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

export const preferencesSchema = z.object({
  defaultFormat: z.enum(['executive-summary', 'action-plan', 'faq', 'mind-map', 'code-organization', 'blog-post']),
  notifications: z.object({
    digestComplete: z.boolean(),
    weeklyDigest: z.boolean(),
    securityAlerts: z.boolean(),
  }),
  privacy: z.object({
    shareAnalytics: z.boolean(),
    publicProfile: z.boolean(),
  }),
});

// === Form State Types ===

export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

export interface FormFieldState {
  value: string;
  error?: string;
  touched: boolean;
  focused: boolean;
}

// === Form Hook Types ===

export interface UseFormProps<T> {
  initialValues: T;
  validationSchema?: z.ZodSchema<T>;
  onSubmit: (values: T) => Promise<void> | void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  handleChange: (field: keyof T) => (value: string | boolean) => void;
  handleBlur: (field: keyof T) => () => void;
  handleSubmit: (e?: React.FormEvent) => void;
  resetForm: () => void;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string) => void;
}

// === Field Component Types ===

export interface FormFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'url' | 'textarea';
  required?: boolean;
  disabled?: boolean;
  value: string;
  error?: string;
  touched?: boolean;
  onChange: (value: string) => void;
  onBlur?: () => void;
  className?: string;
  rows?: number; // for textarea
}

export interface FormCheckboxProps {
  name: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  error?: string;
  onChange: (checked: boolean) => void;
  className?: string;
}

export interface FormSelectProps {
  name: string;
  label?: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  error?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

// === Filter Form Types ===

export interface FilterFormData {
  search: string;
  status: 'all' | 'completed' | 'processing' | 'pending' | 'failed';
  platform: 'all' | 'claude' | 'chatgpt' | 'gemini' | 'perplexity';
  format: 'all' | 'executive-summary' | 'action-plan' | 'faq' | 'mind-map' | 'code-organization' | 'blog-post';
  dateFrom?: string;
  dateTo?: string;
  sortBy: 'newest' | 'oldest' | 'title' | 'cost';
  sortOrder: 'asc' | 'desc';
}

export const filterFormSchema = z.object({
  search: z.string(),
  status: z.enum(['all', 'completed', 'processing', 'pending', 'failed']),
  platform: z.enum(['all', 'claude', 'chatgpt', 'gemini', 'perplexity']),
  format: z.enum(['all', 'executive-summary', 'action-plan', 'faq', 'mind-map', 'code-organization', 'blog-post']),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.enum(['newest', 'oldest', 'title', 'cost']),
  sortOrder: z.enum(['asc', 'desc']),
});

// === Validation Error Types ===

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// === Type helpers ===

export type InferFormData<T extends z.ZodSchema> = z.infer<T>;

// Export inferred types for convenience
export type ClaudeUrlFormDataValidated = InferFormData<typeof claudeUrlSchema>;
export type RawTextFormDataValidated = InferFormData<typeof rawTextSchema>;
export type LoginFormDataValidated = InferFormData<typeof loginSchema>;
export type SignupFormDataValidated = InferFormData<typeof signupSchema>;
export type ProfileFormDataValidated = InferFormData<typeof profileSchema>;
export type PreferencesFormDataValidated = InferFormData<typeof preferencesSchema>;
export type FilterFormDataValidated = InferFormData<typeof filterFormSchema>;