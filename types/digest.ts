// Digest content structure and visualization types
// Defines the shape of processed digest content for different formats

// Importance and confidence levels
export type ImportanceLevel = 'high' | 'medium' | 'low';
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type DifficultyLevel = 'easy' | 'moderate' | 'challenging';
export type TimeframeLevel = 'immediate' | 'short-term' | 'long-term';
export type ComplexityLevel = 'simple' | 'moderate' | 'complex';

// Category types for different content elements
export type InsightCategory = 'learning' | 'strategy' | 'tool' | 'concept' | 'warning';
export type AuthorType = 'Human' | 'Assistant';

// === Executive Summary Digest Structure ===

export interface MainTopic {
  topic: string;
  description: string;
  importance: ImportanceLevel;
}

export interface KeyInsight {
  insight: string;
  category: InsightCategory;
  applicability: string;
  confidence: ConfidenceLevel;
}

export interface ImportantQuestion {
  question: string;
  answer: string;
  relevance: string;
}

export interface ConversationFlow {
  startingPoint: string;
  keyTransitions: string[];
  conclusion: string;
}

export interface PracticalTakeaway {
  action: string;
  timeframe: TimeframeLevel;
  difficulty: DifficultyLevel;
}

export interface ShareableQuote {
  text: string;
  context: string;
  author: AuthorType;
}

export interface DigestMetadata {
  conversationLength: string;
  complexity: ComplexityLevel;
  domain: string;
  completeness: string;
}

// Main executive summary structure
export interface ExecutiveSummaryContent {
  title: string;
  summary: string;
  mainTopics: MainTopic[];
  keyInsights: KeyInsight[];
  importantQuestions: ImportantQuestion[];
  conversationFlow: ConversationFlow;
  practicalTakeaways: PracticalTakeaway[];
  shareableQuotes: ShareableQuote[];
  metadata: DigestMetadata;
}

// === Action Plan Digest Structure ===

export interface ActionPlanPhase {
  phase: string;
  description: string;
  duration: string;
  priority: ImportanceLevel;
}

export interface Action {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: ImportanceLevel;
  timeframe: TimeframeLevel;
  difficulty: DifficultyLevel;
  dependencies?: string[];
  estimatedHours?: number;
  resources?: string[];
  successCriteria?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  criteria: string[];
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  impact: ImportanceLevel;
  mitigation: string;
}

export interface ResourceCollection {
  tools: string[];
  skills: string[];
  materials: string[];
}

export interface ActionPlanContent {
  title: string;
  objective: string;
  summary: string;
  phases: ActionPlanPhase[];
  actions: Action[];
  actionItems: Action[];
  milestones: Milestone[];
  risks: Risk[];
  resources: ResourceCollection;
  categories: string[];
  timeline: {
    immediate: Action[];
    shortTerm: Action[];
    longTerm: Action[];
  };
  metadata: DigestMetadata;
}

// === FAQ Digest Structure ===

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  importance: ImportanceLevel;
  keywords: string[];
  relatedQuestions?: string[];
}

export interface FAQContent {
  title: string;
  summary: string;
  questions: FAQItem[];
  categories: string[];
  topQuestions: FAQItem[];
  metadata: DigestMetadata;
}

// === Mind Map Digest Structure ===

export interface MindMapNode {
  id: string;
  label: string;
  type: 'root' | 'topic' | 'subtopic' | 'detail';
  parentId?: string;
  children?: string[];
  data: {
    description?: string;
    importance?: ImportanceLevel;
    color?: string;
    size?: number;
    position?: { x: number; y: number };
  };
}

export interface MindMapEdge {
  id: string;
  source: string;
  target: string;
  type: 'default' | 'custom';
  data?: {
    relationship?: string;
    strength?: number;
  };
}

export interface MindMapContent {
  title: string;
  summary: string;
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  layout: {
    direction: 'TB' | 'BT' | 'LR' | 'RL';
    spacing: number;
  };
  metadata: DigestMetadata;
}

// === Knowledge Graph Digest Structure ===

export interface KnowledgeGraphNode {
  id: string;
  label: string;
  type: 'concept' | 'entity' | 'relationship' | 'insight';
  data: {
    description?: string;
    importance?: ImportanceLevel;
    category?: string;
    position?: { x: number; y: number };
  };
}

export interface KnowledgeGraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'relates-to' | 'leads-to' | 'depends-on' | 'contradicts';
  data: {
    strength: number;
    label?: string;
  };
}

export interface KnowledgeGraphContent {
  title: string;
  summary: string;
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  clusters: {
    id: string;
    label: string;
    nodeIds: string[];
    color?: string;
  }[];
  metadata: DigestMetadata;
}

// === Code Organization Digest Structure ===

export interface CodeSection {
  id: string;
  title: string;
  type: 'function' | 'class' | 'module' | 'pattern' | 'architecture';
  description: string;
  codeSnippet?: string;
  language?: string;
  importance: ImportanceLevel;
  relationships: string[];
}

export interface CodeOrganizationContent {
  title: string;
  summary: string;
  sections: CodeSection[];
  architecture: {
    overview: string;
    patterns: string[];
    recommendations: string[];
  };
  metadata: DigestMetadata;
}

// === Code Blocks Digest Structure ===

export interface CodeBlock {
  id: string;
  filename: string;
  language: string;
  code: string;
  description: string;
  messageIndex: number;
  blockIndex: number;
}

export interface CodeBlocksContent {
  title: string;
  hasCodeBlocks: boolean;
  summary: string;
  blocks: CodeBlock[];
  metadata: DigestMetadata & {
    totalBlocks: number;
    languages: string[];
  };
}

// === Gantt Chart Digest Structure ===

export interface GanttTask {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  type: 'milestone' | 'task' | 'phase' | 'dependency';
  importance: ImportanceLevel;
  progress: number; // 0-100
  dependencies?: string[];
  assignee?: string;
  category?: string;
}

export interface GanttChartContent {
  title: string;
  summary: string;
  tasks: GanttTask[];
  phases: {
    id: string;
    title: string;
    description: string;
    taskIds: string[];
    startDate: string;
    endDate: string;
  }[];
  timeline: {
    startDate: string;
    endDate: string;
    duration: string;
  };
  metadata: DigestMetadata;
}

// === Decision Tree Digest Structure ===

export interface DecisionNode {
  id: string;
  type: 'question' | 'decision' | 'outcome' | 'action';
  content: string;
  parentId?: string;
  children: string[];
  data: {
    condition?: string;
    confidence?: ConfidenceLevel;
    impact?: ImportanceLevel;
  };
}

export interface DecisionTreeContent {
  title: string;
  summary: string;
  rootNodeId: string;
  nodes: DecisionNode[];
  paths: {
    id: string;
    description: string;
    nodeIds: string[];
    outcome: string;
  }[];
  metadata: DigestMetadata;
}

// === Blog Post Digest Structure ===

export interface BlogSection {
  id: string;
  type: 'introduction' | 'heading' | 'content' | 'code' | 'image' | 'conclusion';
  title?: string;
  content: string;
  order: number;
  metadata?: {
    imagePrompt?: string;
    codeLanguage?: string;
    seoKeywords?: string[];
  };
}

export interface BlogPostContent {
  title: string;
  summary: string;
  sections: BlogSection[];
  seo: {
    metaDescription: string;
    keywords: string[];
    tags: string[];
    readingTime: number;
  };
  images: {
    featured?: string;
    generated: {
      id: string;
      prompt: string;
      alt: string;
      sectionId: string;
    }[];
  };
  metadata: DigestMetadata;
}

// === Union type for all digest content formats ===

export type DigestContent =
  | ExecutiveSummaryContent
  | ActionPlanContent
  | FAQContent
  | MindMapContent
  | KnowledgeGraphContent
  | CodeOrganizationContent
  | CodeBlocksContent
  | GanttChartContent
  | DecisionTreeContent
  | BlogPostContent;

// Type guards for digest content
export function isExecutiveSummary(content: DigestContent): content is ExecutiveSummaryContent {
  return 'mainTopics' in content && 'keyInsights' in content;
}

export function isActionPlan(content: DigestContent): content is ActionPlanContent {
  return 'actionItems' in content && 'timeline' in content;
}

export function isFAQ(content: DigestContent): content is FAQContent {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return 'questions' in content && Array.isArray((content as any).questions);
}

export function isMindMap(content: DigestContent): content is MindMapContent {
  return 'nodes' in content && 'edges' in content && 'layout' in content;
}

export function isKnowledgeGraph(content: DigestContent): content is KnowledgeGraphContent {
  return 'nodes' in content && 'edges' in content && 'clusters' in content;
}

export function isCodeOrganization(content: DigestContent): content is CodeOrganizationContent {
  return 'sections' in content && 'architecture' in content;
}

export function isCodeBlocks(content: DigestContent): content is CodeBlocksContent {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return 'languages' in content && Array.isArray((content as any).languages);
}

export function isGanttChart(content: DigestContent): content is GanttChartContent {
  return 'tasks' in content && 'phases' in content && 'timeline' in content;
}

export function isDecisionTree(content: DigestContent): content is DecisionTreeContent {
  return 'rootNodeId' in content && 'paths' in content;
}

export function isBlogPost(content: DigestContent): content is BlogPostContent {
  return 'sections' in content && 'seo' in content && 'images' in content;
}

// Processing options for different digest types
export interface DigestProcessingOptions {
  format: 'executive-summary' | 'action-plan' | 'faq' | 'mind-map' | 'knowledge-graph' | 'code-organization' | 'code-blocks' | 'gantt-chart' | 'decision-tree' | 'blog-post';
  complexity?: ComplexityLevel;
  maxLength?: number;
  includeMetadata?: boolean;
  customPrompt?: string;
}

// Export options for different formats
export interface ExportOptions {
  format: 'pdf' | 'markdown' | 'json' | 'html';
  includeMetadata?: boolean;
  styling?: 'default' | 'minimal' | 'professional';
  template?: string;
}
