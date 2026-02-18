import axios from "axios";
import type { TicketKind } from "@/types/ticket";

export type PreparePaymentRequest = {
  userId: number;
  ticketType: TicketKind;
  availableDate: string;
  ticketQuantity: number;
};

export type PaymentStatus = "PENDING" | "DONE" | "CANCELED" | "FAILED" | "COMPLETED";

export type PaymentResponse = {
  paymentId: number;
  userId: number;
  orderId: number;
  orderName: string;
  amount: number;
  paymentKey: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
};

export type ConfirmPaymentRequest = {
  paymentKey: string;
  orderId: number;
  tossOrderId: string;
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

const paymentHttp = axios.create({
  baseURL: "",
  timeout: 10_000,
  withCredentials: true,
});

function toPaymentResponse(input: unknown): PaymentResponse {
  const root = input as { data?: PaymentResponseDto } & PaymentResponseDto;
  const dto = (root?.data ?? root) as PaymentResponseDto;

  const amountCandidate =
    dto.amount ?? dto.totalAmount ?? dto.total_amount ?? dto.paymentAmount ?? dto.payment_amount ?? 0;

  return {
    paymentId: dto.paymentId ?? dto.payment_id ?? dto.id ?? 0,
    userId: dto.userId ?? dto.user_id ?? 0,
    orderId: dto.orderId ?? dto.order_id ?? 0,
    orderName: dto.orderName ?? dto.order_name ?? "",
    amount: Number(amountCandidate),
    paymentKey: dto.paymentKey ?? dto.payment_key ?? "",
    paymentMethod: dto.paymentMethod ?? dto.payment_method ?? "",
    paymentStatus: dto.paymentStatus ?? dto.payment_status ?? "PENDING",
    createdAt: dto.createdAt ?? dto.created_at ?? "",
    updatedAt: dto.updatedAt ?? dto.updated_at ?? "",
  };
}

export async function preparePayment(payload: PreparePaymentRequest) {
  const { data } = await paymentHttp.post("/payments", payload);
  return toPaymentResponse(data);
}

export async function confirmPayment(payload: ConfirmPaymentRequest) {
  const { data } = await paymentHttp.post("/payments/confirm", payload);
  return toPaymentResponse(data);
}
