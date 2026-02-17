type TossRequestPaymentParams = {
  amount: number;
  orderId: string;
  orderName: string;
  successUrl: string;
  failUrl: string;
  customerName?: string;
  windowTarget?: "self" | "iframe";
  card?: {
    flowMode?: "DEFAULT" | "DIRECT";
  };
};

type TossPaymentsInstance = {
  requestPayment: (method: string, params: TossRequestPaymentParams) => Promise<void>;
};

type TossPaymentsFactory = (clientKey: string) => TossPaymentsInstance;

declare global {
  interface Window {
    TossPayments?: TossPaymentsFactory;
  }
}

export {};
