import type { Metadata } from "next";
import { DeleteEventButton } from "@/components/admin/delete-event-button";
import { EventFormDialog } from "@/components/admin/event-form-dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Manage Events",
  description: "Create, edit, and delete events.",
};

export default async function AdminEventsPage() {
  const events = await db.event.findMany({ orderBy: { date: "asc" } });

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Events</h1>
          <p className="mt-2 text-muted-foreground">
            Create and manage event listings and capacity.
          </p>
        </div>
        <EventFormDialog
          mode="create"
          trigger={<Button>Create event</Button>}
        />
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Seats</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length > 0 ? (
              events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>{formatDate(event.date)}</TableCell>
                  <TableCell>{event.location}</TableCell>
                  <TableCell>
                    {event.availableSeats}/{event.capacity}
                  </TableCell>
                  <TableCell>{formatPrice(event.price)}</TableCell>
                  <TableCell className="space-x-2 text-right">
                    <EventFormDialog
                      mode="edit"
                      event={event}
                      trigger={
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      }
                    />
                    <DeleteEventButton eventId={event.id} title={event.title} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No events yet. Create your first event.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
