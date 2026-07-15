import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getUserBookings } from "@/actions/bookings";
import { CancelBookingButton } from "@/components/bookings/cancel-booking-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { bookingStatusLabel, bookingStatusVariant } from "@/lib/booking-utils";
import { getSession } from "@/lib/auth";
import { formatDate, formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "My Bookings",
  description: "View and manage your event bookings.",
};

export default async function BookingsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?callbackUrl=/bookings");
  }

  const bookings = await getUserBookings(session.userId);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
        <p className="mt-2 text-muted-foreground">
          View your booking history. Pending bookings require admin approval.
        </p>
      </div>

      {bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle>{booking.event.title}</CardTitle>
                  <CardDescription>{formatDate(booking.event.date)}</CardDescription>
                </div>
                <Badge variant={bookingStatusVariant(booking.status)}>
                  {bookingStatusLabel(booking.status)}
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  {booking.event.image ? (
                    <div className="relative h-16 w-24 overflow-hidden rounded-md">
                      <Image
                        src={booking.event.image}
                        alt={booking.event.title}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>
                  ) : null}
                  <div className="text-sm text-muted-foreground">
                    <p>{booking.event.location}</p>
                    <p>{formatPrice(booking.event.price)}</p>
                    <p>Booked on {formatDate(booking.bookedAt)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/events/${booking.event.id}`}>
                    <Button variant="outline" size="sm">
                      View event
                    </Button>
                  </Link>
                  <CancelBookingButton
                    bookingId={booking.id}
                    status={booking.status}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <h3 className="text-lg font-medium">No bookings yet</h3>
          <p className="mt-2 text-muted-foreground">
            Browse events and book your first experience.
          </p>
          <Link href="/events" className="mt-4 inline-block">
            <Button>Browse events</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
