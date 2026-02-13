import { http } from "@/api/http";
import type { UserTicket } from "@/types/ticket";

type UserTicketDto = {
  ticketOrderId?: number;
  ticket_order_id?: number;
  availableAt?: string;
  available_at?: string;
  activeStatus?: "ACTIVE" | "DEACTIVE";
  active_status?: "ACTIVE" | "DEACTIVE";
  ticketType?: "GENERAL" | "PREMIUM";
  ticket_type?: "GENERAL" | "PREMIUM";
  paymentDate?: string;
  paymentAt?: string;
  payment_at?: string;
};

function mapTicket(dto: UserTicketDto): UserTicket {
  return {
    ticketOrderId: dto.ticketOrderId ?? dto.ticket_order_id ?? 0,
    availableAt: dto.availableAt ?? dto.available_at ?? "",
    activeStatus: dto.activeStatus ?? dto.active_status ?? "DEACTIVE",
    ticketType: dto.ticketType ?? dto.ticket_type ?? "GENERAL",
    paymentDate: dto.paymentDate ?? dto.paymentAt ?? dto.payment_at ?? "",
  };
}

export async function getMyTicketList() {
  const { data } = await http.get<UserTicketDto[]>("/tickets/my");
  return data.map(mapTicket);
}

export async function getAllTicketList() {
  const { data } = await http.get("/ticket-management");
  return data;
}
