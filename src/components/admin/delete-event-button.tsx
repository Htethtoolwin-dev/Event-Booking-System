"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { deleteEvent } from "@/actions/events";
import { Button } from "@/components/ui/button";

type DeleteEventButtonProps = {
  eventId: string;
  title: string;
};

export function DeleteEventButton({ eventId, title }: DeleteEventButtonProps) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${title}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteEvent(eventId);
      if (result.success) {
        toast.success("Event deleted");
      } else {
        toast.error(result.error ?? "Failed to delete event");
      }
    });
  }

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      disabled={pending}
      onClick={handleDelete}
    >
      {pending ? "Deleting..." : "Delete"}
    </Button>
  );
}
