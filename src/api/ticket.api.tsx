import axios from "axios";
import { http } from "@/api/http";
import type {
  IssuedTicket,
  TicketKind,
  TicketManagement,
  TicketOrder,
  TicketProduct,
  UserTicket,
} from "@/types/ticket";

type TicketProductDto = {
  ticketId?: number;
  ticketType?: string;
  quantity?: number;
  price?: number;
};

type TicketManagementDto = {
  ticketManagementId?: number;
  ticketId?: number;
  ticketType?: string;
  availableAt?: string;
  stock?: number;
};

type IssuedTicketDto = {
  issuedTicketId?: number;
  ticketOrderId?: number;
  ticketCode?: string;
  entryStatus?: string;
  claimedAt?: string | null;
};

type TicketOrderDto = {
  ticketOrderId?: number;
  ticketManagementId?: number;
  ticketType?: string;
  availableAt?: string;
  orderQuantity?: number;
  paymentStatus?: string;
  orderedAt?: string;
  issuedTickets?: IssuedTicketDto[];
};

export type CreateTicketOrderPayload = {
  ticketManagementId: number;
  orderQuantity?: number;
};

export type AvailableDate = {
  date: string;
  stock: number;
  ticketManagementId: number;
};

type AvailableDateDto = {
  date?: string;
  stock?: number;
  ticketManagementId?: number;
};

function normalizeTicketType(raw?: string): TicketKind {
  return raw === "PREMIUM" ? "PREMIUM" : "BASIC";
}

function normalizeEntryStatus(raw?: string) {
  return raw === "USED" ? "USED" : "AVAILABLE";
}

function mapTicketProduct(dto: TicketProductDto): TicketProduct {
  return {
    ticketId: dto.ticketId ?? 0,
    ticketType: normalizeTicketType(dto.ticketType),
    quantity: dto.quantity ?? 0,
    price: dto.price ?? 0,
  };
}

function mapTicketManagement(dto: TicketManagementDto): TicketManagement {
  return {
    ticketManagementId: dto.ticketManagementId ?? 0,
    ticketId: dto.ticketId ?? 0,
    ticketType: normalizeTicketType(dto.ticketType),
    availableAt: dto.availableAt ?? "",
    stock: dto.stock ?? 0,
  };
}

function mapIssuedTicket(dto: IssuedTicketDto, fallbackOrderId = 0): IssuedTicket {
  return {
    issuedTicketId: dto.issuedTicketId ?? 0,
    ticketOrderId: dto.ticketOrderId ?? fallbackOrderId,
    ticketCode: dto.ticketCode ?? "",
    entryStatus: normalizeEntryStatus(dto.entryStatus),
    claimedAt: dto.claimedAt ?? null,
  };
}

function mapTicketOrder(dto: TicketOrderDto): TicketOrder {
  const ticketOrderId = dto.ticketOrderId ?? 0;

  return {
    ticketOrderId,
    ticketManagementId: dto.ticketManagementId ?? 0,
    ticketType: normalizeTicketType(dto.ticketType),
    availableAt: dto.availableAt ?? "",
    orderQuantity: dto.orderQuantity ?? 0,
    paymentStatus: dto.paymentStatus === "CANCELLED" ? "CANCELLED" : "ORDERED",
    orderedAt: dto.orderedAt ?? "",
    issuedTickets: (dto.issuedTickets ?? []).map((ticket) => mapIssuedTicket(ticket, ticketOrderId)),
  };
}

function toUserTickets(order: TicketOrder): UserTicket[] {
  if (order.issuedTickets.length === 0) {
    return [
      {
        ticketOrderId: order.ticketOrderId,
        issuedTicketId: 0,
        ticketCode: "",
        availableAt: order.availableAt,
        entryStatus: "AVAILABLE",
        ticketType: order.ticketType,
        paymentDate: order.orderedAt,
      },
    ];
  }

  return order.issuedTickets.map((issuedTicket) => ({
    ticketOrderId: order.ticketOrderId,
    issuedTicketId: issuedTicket.issuedTicketId,
    ticketCode: issuedTicket.ticketCode,
    availableAt: order.availableAt,
    entryStatus: issuedTicket.entryStatus,
    ticketType: order.ticketType,
    paymentDate: order.orderedAt,
  }));
}

export function getTicketErrorMessage(error: unknown, fallback = "티켓 요청 중 오류가 발생했습니다.") {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const data = error.response?.data as { message?: string; code?: string } | undefined;
  return data?.message || data?.code || fallback;
}

export async function getAvailableDatesByType(ticketType: TicketKind): Promise<AvailableDate[]> {
  const { data } = await http.get<AvailableDateDto[]>("/tickets/management/available-dates", {
    params: { ticketType },
  });
  return data.map((dto) => ({
    date: dto.date ?? "",
    stock: dto.stock ?? 0,
    ticketManagementId: dto.ticketManagementId ?? 0,
  }));
}

export async function getTicketProducts() {
  const { data } = await http.get<TicketProductDto[]>("/tickets");
  return data.map(mapTicketProduct);
}

export async function getTicketManagementList(date?: string) {
  const { data } = await http.get<TicketManagementDto[]>("/tickets/management", {
    params: date ? { date } : undefined,
  });
  return data.map(mapTicketManagement);
}

export async function createTicketOrder(payload: CreateTicketOrderPayload) {
  const { data } = await http.post<TicketOrderDto>("/tickets/orders", {
    ticketManagementId: payload.ticketManagementId,
    orderQuantity: payload.orderQuantity ?? 1,
  });
  return mapTicketOrder(data);
}

export async function getMyTicketOrders() {
  const { data } = await http.get<TicketOrderDto[]>("/tickets/orders/my");
  return data.map(mapTicketOrder);
}

export async function getMyTicketList() {
  const orders = await getMyTicketOrders();
  return orders.flatMap(toUserTickets);
}
