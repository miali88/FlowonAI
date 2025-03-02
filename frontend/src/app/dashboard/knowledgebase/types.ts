export type WebContent = {
  url: string;
  id: string | number;
  token_count: number;
}

export interface KnowledgeBaseItem {
  id: number;
  title: string;
  content: string | WebContent[];
  data_type: "text" | "web";
  tag?: string;
  tokens?: number;
  token_count?: number;
  created_at: string;
  root_url?: string;
  url_tokens?: number;
  user_id?: string;
} 