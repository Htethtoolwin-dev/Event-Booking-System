"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { acceptBooking, rejectBooking } from "@/actions/bookings";
import { Button } from "@/components/ui/button";

type BookingReviewActionsProps = {
  bookingId: string;
};

export function BookingReviewActions({ bookingId }: BookingReviewActionsProps) {
  const [pending, startTransition] = useTransition();

  function handleAccept() {
    startTransition(async () => {
      const result = await acceptBooking(bookingId);
      if (result.success) {
        toast.success("Booking accepted");
      } else {
        toast.error(result.error ?? "Failed to accept booking");
      }
    });
  }

  function handleReject() {
    const confirmed = window.confirm(
      "Reject this booking? The seat will be released back to the event.",
    );
    if (!confirmed) return;

    startTransition(async () => {
      const result = await rejectBooking(bookingId);
      if (result.success) {
        toast.success("Booking rejected");
      } else {
        toast.error(result.error ?? "Failed to reject booking");
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" disabled={pending} onClick={handleAccept}>
        Accept
      </Button>
      <Button
        size="sm"
        variant="destructive"
        disabled={pending}
        onClick={handleReject}
      >
        Reject
      </Button>
    </div>
  );
}
