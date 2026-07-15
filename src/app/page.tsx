import Link from "next/link";
import { getFilteredEvents } from "@/actions/events";
import { EventCard } from "@/components/events/event-card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Shield, Sparkles } from "lucide-react";

export default async function HomePage() {
  const featuredEvents = await getFilteredEvents({});
  const upcoming = featuredEvents.slice(0, 3);

  return (
    <div>
      <section className="border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 py-20 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            Portfolio-grade event booking platform
          </div>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Discover events. Book in seconds. Manage everything in one place.
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Browse concerts, conferences, and workshops. Secure JWT authentication,
            real-time seat management, and a full admin dashboard.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/events">
              <Button size="lg" className="gap-2">
                Browse events
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline">
                Create account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border bg-card p-6">
            <Calendar className="mb-3 h-8 w-8 text-primary" />
            <h3 className="font-semibold">Smart event discovery</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Search and filter by keyword, location, and date range.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <Shield className="mb-3 h-8 w-8 text-primary" />
            <h3 className="font-semibold">Secure authentication</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              JWT stored in HttpOnly cookies with role-based route protection.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <Sparkles className="mb-3 h-8 w-8 text-primary" />
            <h3 className="font-semibold">Real-time capacity</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Transactional booking logic keeps seat counts accurate.
            </p>
          </div>
        </div>

        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Featured events</h2>
            <p className="text-muted-foreground">Upcoming events you can book today</p>
          </div>
          <Link href="/events" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>

        {upcoming.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
            No events available yet. Check back soon.
          </div>
        )}
      </section>
    </div>
  );
}
