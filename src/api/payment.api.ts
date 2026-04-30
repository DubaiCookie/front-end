import { http } from "@/api/http";
import { createTicketOrder } from "@/api/ticket.api";
import type { TicketKind } from "@/types/ticket";

export type PreparePaymentRequest = {
  ticketManagementId: number;
  ticketQuantity: number;
  ticketType: TicketKind;
  price: number;
};

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
export type OrderStatus = "PENDING" | "PAID" | "CANCELLED" | "EXPIRED";

export type PaymentResponse = {
  paymentId: number;
  userId: number;
  orderId: number;
  tossOrderId: string;
  orderName: string;
  amount: number;
  paymentKey: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
};

export type PaymentOrderResponse = {
  orderId: number;
  userId: number;
  orderName: string;
  totalAmount: number;
  orderStatus: OrderStatus;
  ticketQuantity: number;
  ticketManagementId: number;
  expiredAt: string;
  createdAt: string;
  updatedAt: string;
};

export type ConfirmPaymentRequest = {
  paymentKey: string;
  orderId: number;
  amount: number;
};

type PaymentResponseDto = {
  id?: number;
  paymentId?: number;
  payment_id?: number;
  userId?: number;
  user_id?: number;
  orderId?: number;
  order_id?: number;
  tossOrderId?: string;
  toss_order_id?: string;
  orderName?: string;
  order_name?: string;
  amount?: number;
  totalAmount?: number;
  total_amount?: number;
  paymentAmount?: number;
  payment_amount?: number;
  paymentKey?: string;
  payment_key?: string;
  paymentMethod?: string;
  payment_method?: string;
  paymentStatus?: PaymentStatus;
  payment_status?: PaymentStatus;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
};

type PaymentOrderResponseDto = {
  id?: number;
  orderId?: number;
  order_id?: number;
  userId?: number;
  user_id?: number;
  orderName?: string;
  order_name?: string;
  totalAmount?: number;
  total_amount?: number;
  amount?: number;
  orderStatus?: OrderStatus;
  order_status?: OrderStatus;
  ticketQuantity?: number;
  ticket_quantity?: number;
  ticketManagementId?: number;
  ticket_management_id?: number;
  expiredAt?: string;
  expired_at?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
};

function toPaymentResponse(input: unknown): PaymentResponse {
  const root = input as { data?: PaymentResponseDto } & PaymentResponseDto;
  const dto = (root?.data ?? root) as PaymentResponseDto;

  const amountCandidate =
    dto.amount ?? dto.totalAmount ?? dto.total_amount ?? dto.paymentAmount ?? dto.payment_amount ?? 0;

  return {
    paymentId: dto.paymentId ?? dto.payment_id ?? dto.id ?? 0,
    userId: dto.userId ?? dto.user_id ?? 0,
    orderId: dto.orderId ?? dto.order_id ?? 0,
    tossOrderId: dto.tossOrderId ?? dto.toss_order_id ?? "",
    orderName: dto.orderName ?? dto.order_name ?? "",
    amount: Number(amountCandidate),
    paymentKey: dto.paymentKey ?? dto.payment_key ?? "",
    paymentMethod: dto.paymentMethod ?? dto.payment_method ?? "",
    paymentStatus: dto.paymentStatus ?? dto.payment_status ?? "PENDING",
    createdAt: dto.createdAt ?? dto.created_at ?? "",
    updatedAt: dto.updatedAt ?? dto.updated_at ?? "",
  };
}

function toPaymentOrderResponse(input: unknown): PaymentOrderResponse {
  const root = input as { data?: PaymentOrderResponseDto } & PaymentOrderResponseDto;
  const dto = (root?.data ?? root) as PaymentOrderResponseDto;

  return {
    orderId: dto.orderId ?? dto.order_id ?? dto.id ?? 0,
    userId: dto.userId ?? dto.user_id ?? 0,
    orderName: dto.orderName ?? dto.order_name ?? "",
    totalAmount: Number(dto.totalAmount ?? dto.total_amount ?? dto.amount ?? 0),
    orderStatus: dto.orderStatus ?? dto.order_status ?? "PENDING",
    ticketQuantity: dto.ticketQuantity ?? dto.ticket_quantity ?? 0,
    ticketManagementId: dto.ticketManagementId ?? dto.ticket_management_id ?? 0,
    expiredAt: dto.expiredAt ?? dto.expired_at ?? "",
    createdAt: dto.createdAt ?? dto.created_at ?? "",
    updatedAt: dto.updatedAt ?? dto.updated_at ?? "",
  };
}

export type PhotoPaymentRequest = {
  attractionImageId: number;
  orderName: string;
  amount: number;
};

export async function preparePhotoPayment(payload: PhotoPaymentRequest) {
  const { data } = await http.post("/payments/photo", {
    ...payload,
    accessToken: getAccessToken(),
  });
  return toPaymentResponse(data);
}

export async function preparePayment(payload: PreparePaymentRequest) {
  const ticketOrder = await createTicketOrder({
    ticketManagementId: payload.ticketManagementId,
    orderQuantity: payload.ticketQuantity,
  });

  const orderName = `${payload.ticketType} 티켓 ${payload.ticketQuantity}매`;
  const amount = payload.price * payload.ticketQuantity;

  const { data } = await http.post("/payments", {
    orderId: ticketOrder.ticketOrderId,
    orderType: "TICKET",
    orderName,
    amount,
  });

  return { ...toPaymentResponse(data), orderName };
}

export async function confirmPayment(payload: ConfirmPaymentRequest) {
  const { data } = await http.post("/payments/confirm", payload);
  return toPaymentResponse(data);
}

export async function getPaymentByOrderId(orderId: number) {
  const { data } = await http.get(`/payments/order/${orderId}`);
  return toPaymentResponse(data);
}

export async function cancelPaymentOrder(orderId: number) {
  const { data } = await http.patch(`/orders/${orderId}/cancel`);
  return toPaymentOrderResponse(data);
}
