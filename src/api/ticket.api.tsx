import { http } from "@/api/http";
import type { UserTicket } from "@/types/ticket";

type UserTicketDto = {
  ticketOrderId?: number;
  ticket_order_id?: number;
  availableAt?: string;
  available_at?: string;
  activeStatus?: "ACTIVE" | "DEACTIVE";
  active_status?: "ACTIVE" | "DEACTIVE";
  ticketType?: "BASIC" | "GENERAL" | "PREMIUM";
  ticket_type?: "BASIC" | "GENERAL" | "PREMIUM";
  paymentDate?: string;
  paymentAt?: string;
  payment_at?: string;
};

function normalizeTicketType(raw?: UserTicketDto["ticketType"]) {
  return raw === "PREMIUM" ? "PREMIUM" : "BASIC";
}

function normalizeTicketListPayload(payload: unknown): UserTicketDto[] {
  if (Array.isArray(payload)) {
    return payload as UserTicketDto[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const wrapped = payload as {
    data?: unknown;
    tickets?: unknown;
    content?: unknown;
  };

  if (Array.isArray(wrapped.data)) {
    return wrapped.data as UserTicketDto[];
  }

  if (Array.isArray(wrapped.tickets)) {
    return wrapped.tickets as UserTicketDto[];
  }

  if (Array.isArray(wrapped.content)) {
    return wrapped.content as UserTicketDto[];
  }

  return [];
}

function mapTicket(dto: UserTicketDto): UserTicket {
  return {
    ticketOrderId: dto.ticketOrderId ?? dto.ticket_order_id ?? 0,
    availableAt: dto.availableAt ?? dto.available_at ?? "",
    activeStatus: dto.activeStatus ?? dto.active_status ?? "DEACTIVE",
    ticketType: normalizeTicketType(dto.ticketType ?? dto.ticket_type),
    paymentDate: dto.paymentDate ?? dto.paymentAt ?? dto.payment_at ?? "",
  };
}

export async function getMyTicketList() {
  const { data } = await http.get("/tickets/my");
  const tickets = normalizeTicketListPayload(data);
  return tickets.map(mapTicket);
}

export async function activateTicket(ticketOrderId: number) {
  const { data } = await http.patch(`/tickets/${ticketOrderId}/activate`);
  return data;
}
