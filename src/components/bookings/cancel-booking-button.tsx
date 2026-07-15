"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { cancelBooking } from "@/actions/bookings";
import { Button } from "@/components/ui/button";
import { emptyActionState } from "@/types";

type BookingStatus = "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED";

type CancelBookingButtonProps = {
  bookingId: string;
  status: BookingStatus;
};

export function CancelBookingButton({ bookingId, status }: CancelBookingButtonProps) {
  const [state, formAction, pending] = useActionState(
    cancelBooking,
    emptyActionState,
  );

  useEffect(() => {
    if (state.success) {
      toast.success("Booking cancelled");
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  if (status === "CANCELLED" || status === "REJECTED") {
    return null;
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="bookingId" value={bookingId} />
      <Button type="submit" variant="destructive" size="sm" disabled={pending}>
        {pending ? "Cancelling..." : "Cancel booking"}
      </Button>
    </form>
  );
}
