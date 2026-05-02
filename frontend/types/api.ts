// ─── Enums ────────────────────────────────────────────────────────────────────
export type DetectedLanguage =
  | 'tamil'
  | 'sinhala'
  | 'english'
  | 'tanglish'
  | 'singlish'
  | 'mixed_other'
  | 'unknown';

export type ScriptType =
  | 'tamil_native'
  | 'sinhala_native'
  | 'latin'
  | 'mixed';

export type SentimentLabel = 'positive' | 'negative' | 'neutral' | 'mixed';

export type ThemeLabel =
  | 'service'
  | 'price'
  | 'quality'
  | 'delivery'
  | 'staff'
  | 'food'
  | 'app_ux'
  | 'billing'
  | 'other';

export type FeedbackSource =
  | 'api'
  | 'batch_api'
  | 'csv_upload'
  | 'excel_upload'
  | 'whatsapp'
  | 'google_reviews'
  | 'facebook'
  | 'manual';

export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';

export type BatchJobStatus = 'queued' | 'processing' | 'completed' | 'partial' | 'failed';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  timezone?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ─── User ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  timezone: string;
  createdAt: string;
}

// ─── Project ──────────────────────────────────────────────────────────────────
export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    feedback: number;
  };
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
}

// ─── Feedback ─────────────────────────────────────────────────────────────────
export interface Feedback {
  id: string;
  rawText: string;
  charCount: number;
  source: FeedbackSource;
  externalId?: string;
  projectId: string;
  status: AnalysisStatus;
  createdAt: string;
  analysis?: Analysis;
}

export interface SubmitFeedbackRequest {
  projectId: string;
  text: string;
  source?: FeedbackSource;
  externalId?: string;
}

export interface FeedbackListResponse {
  data: Feedback[];
  total: number;
  page: number;
  limit: number;
}

export interface FeedbackFilters {
  page?: number;
  limit?: number;
  lang?: string;
  sentiment?: string;
  theme?: string;
  source?: string;
  search?: string;
  from?: string;
  to?: string;
}

// ─── Analysis ─────────────────────────────────────────────────────────────────
export interface Analysis {
  id: string;
  feedbackId: string;
  detectedLanguage: DetectedLanguage;
  scriptType: ScriptType;
  sentiment: SentimentLabel;
  confidence: number;
  themes: ThemeLabel[];
  isSarcastic: boolean;
  containsCodeMix: boolean;
  rationale?: string;
  modelUsed: string;
  inputTokens?: number;
  outputTokens?: number;
  latencyMs?: number;
  retryCount: number;
  createdAt: string;
}

// ─── Batch Job ────────────────────────────────────────────────────────────────
export interface BatchJob {
  id: string;
  projectId: string;
  filename?: string;
  status: BatchJobStatus;
  totalRows: number;
  processedRows: number;
  successCount: number;
  failedCount: number;
  skippedCount: number;
  errors?: Array<{ row: number; reason: string }>;
  createdAt: string;
  updatedAt: string;
}

// ─── Report ───────────────────────────────────────────────────────────────────
export interface SentimentReport {
  projectId: string;
  totalFeedback: number;
  sentimentBreakdown: {
    positive: number;
    negative: number;
    neutral: number;
    mixed: number;
  };
  languageBreakdown: Record<DetectedLanguage, number>;
  themeBreakdown: Record<ThemeLabel, number>;
  avgConfidence: number;
  sarcasticCount: number;
  codeMixCount: number;
  period?: {
    from: string;
    to: string;
  };
}

export interface SentimentTrendPoint {
  date: string;
  positive: number;
  negative: number;
  neutral: number;
  mixed: number;
  total: number;
}

export interface ThemeStat {
  theme: ThemeLabel;
  count: number;
  avgSentiment: number;
}

// ─── Alert ────────────────────────────────────────────────────────────────────
export interface Alert {
  id: string;
  projectId: string;
  project?: Pick<Project, 'id' | 'name' | 'slug'>;
  severity: AlertSeverity;
  title: string;
  message: string;
  triggerContext?: string;
  isResolved: boolean;
  resolvedAt?: string;
  createdAt: string;
}

// ─── API Key ──────────────────────────────────────────────────────────────────
export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  lastUsedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface CreateApiKeyRequest {
  name: string;
  scopes: string[];
  expiresAt?: string;
}

export interface CreateApiKeyResponse {
  key: ApiKey;
  plaintext: string;
}

// ─── Generic API response ─────────────────────────────────────────────────────
export interface ApiError {
  status: 'error' | 'fail';
  message: string;
  errors?: Record<string, string[]>;
}
