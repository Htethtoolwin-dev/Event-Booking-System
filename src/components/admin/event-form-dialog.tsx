"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { createEvent, updateEvent } from "@/actions/events";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { emptyActionState } from "@/types";

type EventFormDialogProps = {
  mode: "create" | "edit";
  event?: {
    id: string;
    title: string;
    description: string;
    location: string;
    date: Date;
    capacity: number;
    price: number;
    image: string | null;
  };
  trigger: React.ReactNode;
};

function toDateTimeLocalValue(date: Date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export function EventFormDialog({ mode, event, trigger }: EventFormDialogProps) {
  const [open, setOpen] = useState(false);
  const action = mode === "create" ? createEvent : updateEvent;
  const [state, formAction, pending] = useActionState(action, emptyActionState);

  useEffect(() => {
    if (state.success) {
      toast.success(mode === "create" ? "Event created" : "Event updated");
      setOpen(false);
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, mode]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create event" : "Edit event"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new event to the platform."
              : "Update event details and capacity."}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          {mode === "edit" && event ? (
            <input type="hidden" name="eventId" value={event.id} />
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              defaultValue={event?.title}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={event?.description}
              required
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              defaultValue={event?.location}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date & time</Label>
            <Input
              id="date"
              name="date"
              type="datetime-local"
              defaultValue={event ? toDateTimeLocalValue(event.date) : undefined}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                min={1}
                defaultValue={event?.capacity}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min={0}
                step="0.01"
                defaultValue={event?.price}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">Image URL (optional)</Label>
            <Input
              id="image"
              name="image"
              type="url"
              defaultValue={event?.image ?? ""}
              placeholder="https://images.unsplash.com/..."
            />
          </div>
          <Button type="submit" disabled={pending} className="w-full">
            {pending
              ? "Saving..."
              : mode === "create"
                ? "Create event"
                : "Save changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
