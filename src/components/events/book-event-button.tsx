"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { bookEvent } from "@/actions/bookings";
import { Button } from "@/components/ui/button";
import { emptyActionState } from "@/types";

type BookEventButtonProps = {
  eventId: string;
  disabled?: boolean;
};

export function BookEventButton({ eventId, disabled }: BookEventButtonProps) {
  const [state, formAction, pending] = useActionState(bookEvent, emptyActionState);

  useEffect(() => {
    if (state.success) {
      toast.success("Booking submitted! Awaiting admin approval.");
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form action={formAction}>
      <input type="hidden" name="eventId" value={eventId} />
      <Button type="submit" disabled={disabled || pending} className="w-full sm:w-auto">
        {pending ? "Booking..." : disabled ? "Sold out" : "Book now"}
      </Button>
    </form>
  );
}
