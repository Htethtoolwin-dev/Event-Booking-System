"use server";

import { BookingStatus } from "@/generated/prisma/client";
import { formatZodErrors } from "@/lib/action-utils";
import { holdsSeat } from "@/lib/booking-utils";
import { requireAdmin, requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  bookEventSchema,
  cancelBookingSchema,
} from "@/lib/validations/booking";
import { ActionState } from "@/types";
import { revalidatePath } from "next/cache";

function revalidateBookingPaths(eventId?: string) {
  revalidatePath("/events");
  if (eventId) {
    revalidatePath(`/events/${eventId}`);
  }
  revalidatePath("/bookings");
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
}

export async function bookEvent(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let session;
  try {
    session = await requireSession();
  } catch {
    return { error: "You must be signed in to book an event" };
  }

  const parsed = bookEventSchema.safeParse({
    eventId: formData.get("eventId"),
  });

  if (!parsed.success) {
    return { fieldErrors: formatZodErrors(parsed.error.flatten().fieldErrors) };
  }

  const { eventId } = parsed.data;

  try {
    await db.$transaction(async (tx) => {
      const event = await tx.event.findUnique({ where: { id: eventId } });
      if (!event) {
        throw new Error("Event not found");
      }

      if (event.availableSeats <= 0) {
        throw new Error("No seats available for this event");
      }

      const existingBooking = await tx.booking.findUnique({
        where: {
          userId_eventId: {
            userId: session.userId,
            eventId,
          },
        },
      });

      if (
        existingBooking &&
        (existingBooking.status === BookingStatus.CONFIRMED ||
          existingBooking.status === BookingStatus.PENDING)
      ) {
        throw new Error("You already have an active booking for this event");
      }

      if (
        existingBooking &&
        (existingBooking.status === BookingStatus.CANCELLED ||
          existingBooking.status === BookingStatus.REJECTED)
      ) {
        await tx.booking.update({
          where: { id: existingBooking.id },
          data: {
            status: BookingStatus.PENDING,
            bookedAt: new Date(),
          },
        });
      } else {
        await tx.booking.create({
          data: {
            userId: session.userId,
            eventId,
            status: BookingStatus.PENDING,
          },
        });
      }

      await tx.event.update({
        where: { id: eventId },
        data: { availableSeats: { decrement: 1 } },
      });
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to book event",
    };
  }

  revalidateBookingPaths(eventId);

  return { success: true };
}

export async function cancelBooking(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let session;
  try {
    session = await requireSession();
  } catch {
    return { error: "You must be signed in to cancel a booking" };
  }

  const parsed = cancelBookingSchema.safeParse({
    bookingId: formData.get("bookingId"),
  });

  if (!parsed.success) {
    return { fieldErrors: formatZodErrors(parsed.error.flatten().fieldErrors) };
  }

  const { bookingId } = parsed.data;

  try {
    await db.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { event: true },
      });

      if (!booking) {
        throw new Error("Booking not found");
      }

      if (booking.userId !== session.userId) {
        throw new Error("You can only cancel your own bookings");
      }

      if (
        booking.status === BookingStatus.CANCELLED ||
        booking.status === BookingStatus.REJECTED
      ) {
        throw new Error("This booking can no longer be cancelled");
      }

      await tx.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.CANCELLED },
      });

      if (holdsSeat(booking.status)) {
        await tx.event.update({
          where: { id: booking.eventId },
          data: { availableSeats: { increment: 1 } },
        });
      }
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to cancel booking",
    };
  }

  revalidateBookingPaths();

  return { success: true };
}

export async function acceptBooking(bookingId: string): Promise<ActionState> {
  try {
    await requireAdmin();
  } catch {
    return { error: "Unauthorized" };
  }

  try {
    await db.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({ where: { id: bookingId } });
      if (!booking) {
        throw new Error("Booking not found");
      }

      if (booking.status !== BookingStatus.PENDING) {
        throw new Error("Only pending bookings can be accepted");
      }

      await tx.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.CONFIRMED },
      });
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to accept booking",
    };
  }

  revalidateBookingPaths();

  return { success: true };
}

export async function rejectBooking(bookingId: string): Promise<ActionState> {
  try {
    await requireAdmin();
  } catch {
    return { error: "Unauthorized" };
  }

  try {
    await db.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({ where: { id: bookingId } });
      if (!booking) {
        throw new Error("Booking not found");
      }

      if (booking.status !== BookingStatus.PENDING) {
        throw new Error("Only pending bookings can be rejected");
      }

      await tx.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.REJECTED },
      });

      await tx.event.update({
        where: { id: booking.eventId },
        data: { availableSeats: { increment: 1 } },
      });
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to reject booking",
    };
  }

  revalidateBookingPaths();

  return { success: true };
}

export async function getUserBookings(userId: string) {
  return db.booking.findMany({
    where: { userId },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          location: true,
          date: true,
          price: true,
          image: true,
        },
      },
    },
    orderBy: { bookedAt: "desc" },
  });
}
