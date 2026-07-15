import type { Metadata } from "next";
import { Suspense } from "react";
import { getFilteredEvents } from "@/actions/events";
import { EventCard } from "@/components/events/event-card";
import { EventFilters } from "@/components/events/event-filters";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Events",
  description: "Browse and search upcoming events.",
};

type EventsPageProps = {
  searchParams: Promise<{
    q?: string;
    location?: string;
    from?: string;
    to?: string;
  }>;
};

function FiltersSkeleton() {
  return <Skeleton className="h-40 w-full rounded-xl" />;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams;
  const events = await getFilteredEvents(params);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Events</h1>
        <p className="mt-2 text-muted-foreground">
          Find your next experience from our curated list of events.
        </p>
      </div>

      <div className="mb-8">
        <Suspense fallback={<FiltersSkeleton />}>
          <EventFilters />
        </Suspense>
      </div>

      {events.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <h3 className="text-lg font-medium">No events found</h3>
          <p className="mt-2 text-muted-foreground">
            Try adjusting your search filters to see more results.
          </p>
        </div>
      )}
    </div>
  );
}
