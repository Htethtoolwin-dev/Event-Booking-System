import { z } from "zod";

export const eventFilterSchema = z.object({
  q: z.string().optional(),
  location: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(2, "Location is required").max(200),
  date: z.string().min(1, "Date is required"),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  image: z.string().url("Image must be a valid URL").optional().or(z.literal("")),
});

export type EventFilterInput = z.infer<typeof eventFilterSchema>;
export type EventInput = z.infer<typeof eventSchema>;
