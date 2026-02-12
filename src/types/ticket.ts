type TicketKind = "GENERAL" | "PREMIUM";
type ActiveStatus = "ACTIVE" | "DEACTIVE";

export interface UserTicket {
  userTicketId: number;
  availableAt: string;
  activeStatus: ActiveStatus;
  ticketType: TicketKind;
  paymentDate: string;
}