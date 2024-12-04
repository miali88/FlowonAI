export type WebContent = {
  url: string;
  id: string;
  token_count: number;
}

export interface KnowledgeBaseItem {
  id: number;
  title: string;
  content: string;
  data_type: "text" | "web";
  tag: string;
  tokens: number;
  created_at: string;
  root_url?: string;
  url_tokens?: number;
} 