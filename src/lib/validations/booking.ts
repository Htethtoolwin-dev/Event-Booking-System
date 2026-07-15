import { z } from "zod";

export const bookEventSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
});

export const cancelBookingSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
});

export const reviewBookingSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
});
