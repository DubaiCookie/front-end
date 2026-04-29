export type TicketKind = "BASIC" | "PREMIUM";
export type TicketEntryStatus = "BEFORE" | "AVAILABLE" | "USED" | "EXPIRED";

export interface TicketProduct {
  ticketId: number;
  ticketType: TicketKind;
  quantity: number;
  price: number;
}

export interface TicketManagement {
  ticketManagementId: number;
  ticketId: number;
  ticketType: TicketKind;
  availableAt: string;
  stock: number;
}

export interface IssuedTicket {
  issuedTicketId: number;
  ticketOrderId: number;
  ticketCode: string;
  entryStatus: TicketEntryStatus;
  claimedAt: string | null;
}

export interface TicketOrder {
  ticketOrderId: number;
  ticketManagementId: number;
  ticketType: TicketKind;
  availableAt: string;
  orderQuantity: number;
  paymentStatus: "ORDERED" | "CANCELLED";
  orderedAt: string;
  issuedTickets: IssuedTicket[];
}

export interface UserTicket {
  ticketOrderId: number;
  issuedTicketId: number;
  ticketCode: string;
  availableAt: string;
  entryStatus: TicketEntryStatus;
  ticketType: TicketKind;
  paymentDate: string;
}
