export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ChatRequest = {
  messages: ChatMessage[];
  conversation_id?: string | null;
  top_k?: number | null;
};

export type RetrievedSource = {
  id: string;
  title: string;
  category: string;
  score: number;
  excerpt: string;
};

export type ChatResponse = {
  conversation_id: string;
  answer: string;
  sources: RetrievedSource[];
};
