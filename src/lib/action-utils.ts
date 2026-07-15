import { ActionState } from "@/types";
import { ZodError } from "zod";

export function formatZodErrors(
  fieldErrors: Record<string, string[] | undefined>,
): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(fieldErrors)
      .filter((entry): entry is [string, string[]] => !!entry[1]?.length)
      .map(([key, value]) => [key, value]),
  );
}

export function zodActionError(error: ZodError): ActionState {
  return {
    fieldErrors: formatZodErrors(error.flatten().fieldErrors),
  };
}
