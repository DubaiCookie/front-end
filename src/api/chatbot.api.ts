import axios from "axios";
import { env } from "@/utils/env";
import type { ChatRequest, ChatResponse } from "@/types/chatbot";

const AI_BASE_URL = env.API_BASE_URL;

const chatbotHttp = axios.create({
  baseURL: AI_BASE_URL,
  timeout: 60_000,
  withCredentials: true,
});

/** RAG 챗봇에 질의 */
export async function askChatbot(body: ChatRequest): Promise<ChatResponse> {
  const { data } = await chatbotHttp.post<ChatResponse>("/chatbot/chat", body);
  return data;
}
