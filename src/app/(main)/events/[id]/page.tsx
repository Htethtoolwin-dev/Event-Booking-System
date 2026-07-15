import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookEventButton } from "@/components/events/book-event-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookingStatus } from "@/generated/prisma/client";
import { bookingStatusLabel } from "@/lib/booking-utils";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/format";
import { Calendar, MapPin, Users } from "lucide-react";

type EventDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: EventDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await db.event.findUnique({ where: { id } });

  if (!event) {
    return { title: "Event not found" };
  }

  return {
    title: event.title,
    description: event.description,
  };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;
  const session = await getSession();

  const event = await db.event.findUnique({ where: { id } });
  if (!event) {
    notFound();
  }

  let userBooking = null;
  if (session) {
    userBooking = await db.booking.findUnique({
      where: {
        userId_eventId: {
          userId: session.userId,
          eventId: id,
        },
      },
    });
  }

  const hasActiveBooking =
    userBooking?.status === BookingStatus.CONFIRMED ||
    userBooking?.status === BookingStatus.PENDING;
  const isSoldOut = event.availableSeats === 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="relative aspect-[21/9] bg-muted">
          {event.image ? (
            <Image
              src={event.image}
              alt={event.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          ) : null}
        </div>
        <div className="space-y-6 p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
              <p className="mt-3 max-w-3xl text-muted-foreground">{event.description}</p>
            </div>
            <Badge className="text-base">{formatPrice(event.price)}</Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-2 rounded-lg border p-4 text-sm">
              <Calendar className="h-4 w-4 text-primary" />
              {formatDate(event.date)}
            </div>
            <div className="flex items-center gap-2 rounded-lg border p-4 text-sm">
              <MapPin className="h-4 w-4 text-primary" />
              {event.location}
            </div>
            <div className="flex items-center gap-2 rounded-lg border p-4 text-sm">
              <Users className="h-4 w-4 text-primary" />
              {event.availableSeats} of {event.capacity} seats available
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t pt-6">
            {session ? (
              hasActiveBooking ? (
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="secondary">
                    {userBooking?.status === BookingStatus.PENDING
                      ? bookingStatusLabel(BookingStatus.PENDING)
                      : "You have booked this event"}
                  </Badge>
                  <Link href="/bookings">
                    <Button variant="outline">View my bookings</Button>
                  </Link>
                </div>
              ) : (
                <BookEventButton eventId={event.id} disabled={isSoldOut} />
              )
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm text-muted-foreground">
                  Sign in to book this event.
                </p>
                <Link href="/login">
                  <Button>Sign in to book</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
