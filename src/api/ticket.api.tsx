import { http } from "@/api/http";

export async function getMyTicketList() {
  const { data } = await http.get("/tickets/my");
  return data;
}

export async function getAllTicketList() {
  const { data } = await http.get("/ticket-management");
  return data;
}