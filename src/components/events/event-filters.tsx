"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function EventFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    const q = formData.get("q")?.toString().trim();
    const location = formData.get("location")?.toString().trim();
    const from = formData.get("from")?.toString();
    const to = formData.get("to")?.toString();

    if (q) params.set("q", q);
    if (location) params.set("location", location);
    if (from) params.set("from", from);
    if (to) params.set("to", to);

    startTransition(() => {
      router.push(`/events?${params.toString()}`);
    });
  }

  function handleClear() {
    startTransition(() => {
      router.push("/events");
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-xl border bg-card p-4 md:grid-cols-2 lg:grid-cols-5"
    >
      <div className="space-y-2 lg:col-span-2">
        <Label htmlFor="q">Search</Label>
        <Input
          id="q"
          name="q"
          placeholder="Concert, summit, expo..."
          defaultValue={searchParams.get("q") ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          placeholder="City or venue"
          defaultValue={searchParams.get("location") ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="from">From</Label>
        <Input
          id="from"
          name="from"
          type="date"
          defaultValue={searchParams.get("from") ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="to">To</Label>
        <Input
          id="to"
          name="to"
          type="date"
          defaultValue={searchParams.get("to") ?? ""}
        />
      </div>
      <div className="flex items-end gap-2 lg:col-span-5">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Filtering..." : "Apply filters"}
        </Button>
        <Button type="button" variant="outline" onClick={handleClear}>
          Clear
        </Button>
      </div>
    </form>
  );
}
