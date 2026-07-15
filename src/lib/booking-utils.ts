import { BookingStatus } from "@/generated/prisma/client";

export function holdsSeat(status: BookingStatus) {
  return status === BookingStatus.PENDING || status === BookingStatus.CONFIRMED;
}

export function bookingStatusLabel(status: BookingStatus) {
  switch (status) {
    case BookingStatus.PENDING:
      return "Pending approval";
    case BookingStatus.CONFIRMED:
      return "Confirmed";
    case BookingStatus.REJECTED:
      return "Rejected";
    case BookingStatus.CANCELLED:
      return "Cancelled";
    default:
      return status;
  }
}

export function bookingStatusVariant(
  status: BookingStatus,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case BookingStatus.CONFIRMED:
      return "default";
    case BookingStatus.PENDING:
      return "outline";
    case BookingStatus.REJECTED:
    case BookingStatus.CANCELLED:
      return "secondary";
    default:
      return "secondary";
  }
}
