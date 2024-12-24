export interface AnalyticsDateRange {
  from: Date | null;
  to: Date | null;
}

export interface TopicAnalysis {
  topic: string;
  count: number;
  sentiment: number;
  examples: string[];
  confidence: number;
  relatedTopics: string[];
}

export interface SentimentAnalysis {
  date: string;
  average: number;
  positive: number;
  negative: number;
  neutral: number;
}

export interface ConversationFlow {
  averageSteps: number;
  resolutionRate: number;
  handoffRate: number;
  commonPaths: {
    path: string[];
    count: number;
  }[];
}

export interface KnowledgeGap {
  topic: string;
  confidence: number;
  frequency: number;
  examples: string[];
}

export interface SemanticAnalytics {
  topics: TopicAnalysis[];
  sentiment: SentimentAnalysis[];
  flow: ConversationFlow;
  gaps: KnowledgeGap[];
} 