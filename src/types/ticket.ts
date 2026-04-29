export type TicketKind = "BASIC" | "PREMIUM";
export type ActiveStatus = "ACTIVE" | "DEACTIVE";

export interface UserTicket {
  ticketOrderId: number;
  availableAt: string;
  activeStatus: ActiveStatus;
  ticketType: TicketKind;
  paymentDate: string;
}
