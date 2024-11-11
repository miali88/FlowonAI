export type WebContent = {
  url: string;
  id: string;
  token_count: number;
}

export type KnowledgeBaseItem = {
  id: number;
  title: string;
  content: string | WebContent[];
  data_type: string;
  tag: string;
  tokens: number;
  created_at: string;
  root_url?: string;
  url_tokens?: number;
  token_count?: number;
} 