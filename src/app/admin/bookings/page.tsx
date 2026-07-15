import type { Metadata } from "next";
import { BookingReviewActions } from "@/components/admin/booking-review-actions";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookingStatus } from "@/generated/prisma/client";
import { bookingStatusLabel, bookingStatusVariant } from "@/lib/booking-utils";
import { db } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Manage Bookings",
  description: "Review and manage platform bookings.",
};

export default async function AdminBookingsPage() {
  const bookings = await db.booking.findMany({
    include: {
      user: { select: { name: true, email: true } },
      event: { select: { title: true, price: true, date: true } },
    },
    orderBy: { bookedAt: "desc" },
  });

  const pendingCount = bookings.filter(
    (booking) => booking.status === BookingStatus.PENDING,
  ).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">All Bookings</h1>
        <p className="mt-2 text-muted-foreground">
          Review booking requests and accept or reject pending reservations.
        </p>
        {pendingCount > 0 ? (
          <p className="mt-2 text-sm font-medium text-primary">
            {pendingCount} booking{pendingCount === 1 ? "" : "s"} awaiting review
          </p>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Event date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Booked at</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{booking.user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.user.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{booking.event.title}</TableCell>
                  <TableCell>{formatDate(booking.event.date)}</TableCell>
                  <TableCell>
                    <Badge variant={bookingStatusVariant(booking.status)}>
                      {bookingStatusLabel(booking.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(booking.bookedAt)}</TableCell>
                  <TableCell>{formatPrice(booking.event.price)}</TableCell>
                  <TableCell className="text-right">
                    {booking.status === BookingStatus.PENDING ? (
                      <BookingReviewActions bookingId={booking.id} />
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No bookings yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
