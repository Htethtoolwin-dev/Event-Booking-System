"use server";

import { BookingStatus, Prisma } from "@/generated/prisma/client";
import { formatZodErrors } from "@/lib/action-utils";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { eventSchema } from "@/lib/validations/event";
import { ActionState } from "@/types";
import { revalidatePath } from "next/cache";

export async function createEvent(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin();
  } catch {
    return { error: "Unauthorized" };
  }

  const parsed = eventSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    location: formData.get("location"),
    date: formData.get("date"),
    capacity: formData.get("capacity"),
    price: formData.get("price"),
    image: formData.get("image") || undefined,
  });

  if (!parsed.success) {
    return { fieldErrors: formatZodErrors(parsed.error.flatten().fieldErrors) };
  }

  const { title, description, location, date, capacity, price, image } =
    parsed.data;

  await db.event.create({
    data: {
      title,
      description,
      location,
      date: new Date(date),
      capacity,
      availableSeats: capacity,
      price,
      image: image || null,
    },
  });

  revalidatePath("/events");
  revalidatePath("/admin");
  revalidatePath("/admin/events");

  return { success: true };
}

export async function updateEvent(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin();
  } catch {
    return { error: "Unauthorized" };
  }

  const eventId = formData.get("eventId");
  if (typeof eventId !== "string" || !eventId) {
    return { error: "Event ID is required" };
  }

  const parsed = eventSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    location: formData.get("location"),
    date: formData.get("date"),
    capacity: formData.get("capacity"),
    price: formData.get("price"),
    image: formData.get("image") || undefined,
  });

  if (!parsed.success) {
    return { fieldErrors: formatZodErrors(parsed.error.flatten().fieldErrors) };
  }

  const existingEvent = await db.event.findUnique({ where: { id: eventId } });
  if (!existingEvent) {
    return { error: "Event not found" };
  }

  const { title, description, location, date, capacity, price, image } =
    parsed.data;

  const activeBookings = await db.booking.count({
    where: {
      eventId,
      status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
    },
  });

  if (capacity < activeBookings) {
    return {
      error: `Capacity cannot be less than active bookings (${activeBookings})`,
    };
  }

  const seatsDelta = capacity - existingEvent.capacity;
  const nextAvailableSeats = existingEvent.availableSeats + seatsDelta;

  if (nextAvailableSeats < 0) {
    return { error: "Invalid capacity adjustment for current bookings" };
  }

  await db.event.update({
    where: { id: eventId },
    data: {
      title,
      description,
      location,
      date: new Date(date),
      capacity,
      availableSeats: nextAvailableSeats,
      price,
      image: image || null,
    },
  });

  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);
  revalidatePath("/admin");
  revalidatePath("/admin/events");

  return { success: true };
}

export async function deleteEvent(eventId: string): Promise<ActionState> {
  try {
    await requireAdmin();
  } catch {
    return { error: "Unauthorized" };
  }

  const activeBookings = await db.booking.count({
    where: {
      eventId,
      status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
    },
  });

  if (activeBookings > 0) {
    return {
      error:
        "Cannot delete an event with pending or confirmed bookings. Reject or cancel bookings first.",
    };
  }

  await db.event.delete({ where: { id: eventId } });

  revalidatePath("/events");
  revalidatePath("/admin");
  revalidatePath("/admin/events");

  return { success: true };
}

export type EventSearchParams = {
  q?: string;
  location?: string;
  from?: string;
  to?: string;
};

export async function getFilteredEvents(searchParams: EventSearchParams) {
  const where: Prisma.EventWhereInput = {};

  if (searchParams.q) {
    where.OR = [
      { title: { contains: searchParams.q } },
      { description: { contains: searchParams.q } },
    ];
  }

  if (searchParams.location) {
    where.location = { contains: searchParams.location };
  }

  if (searchParams.from || searchParams.to) {
    where.date = {};
    if (searchParams.from) {
      where.date.gte = new Date(searchParams.from);
    }
    if (searchParams.to) {
      where.date.lte = new Date(`${searchParams.to}T23:59:59.999Z`);
    }
  }

  return db.event.findMany({
    where,
    orderBy: { date: "asc" },
  });
}
