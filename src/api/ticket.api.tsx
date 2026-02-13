import { http } from "@/api/http";
import type { UserTicket } from "@/types/ticket";

export async function getMyTicketList() {
  const { data } = await http.get<UserTicket[]>("/tickets/my");
  return data;
}

export async function getAllTicketList() {
  const { data } = await http.get("/ticket-management");
  return data;
}
