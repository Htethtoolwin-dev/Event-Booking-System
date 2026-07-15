import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookingStatus } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { CalendarDays, Clock, DollarSign, Ticket, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Overview of platform activity and metrics.",
};

export default async function AdminDashboardPage() {
  const [userCount, eventCount, confirmedCount, pendingCount, revenueAggregate] =
    await Promise.all([
      db.user.count(),
      db.event.count(),
      db.booking.count({ where: { status: BookingStatus.CONFIRMED } }),
      db.booking.count({ where: { status: BookingStatus.PENDING } }),
      db.booking.findMany({
        where: { status: BookingStatus.CONFIRMED },
        include: { event: { select: { price: true } } },
      }),
    ]);

  const revenue = revenueAggregate.reduce(
    (total, booking) => total + booking.event.price,
    0,
  );

  const stats = [
    {
      title: "Total users",
      value: userCount,
      description: "Registered accounts",
      icon: Users,
    },
    {
      title: "Active events",
      value: eventCount,
      description: "Published events",
      icon: CalendarDays,
    },
    {
      title: "Confirmed bookings",
      value: confirmedCount,
      description: "Admin-approved reservations",
      icon: Ticket,
    },
    {
      title: "Pending review",
      value: pendingCount,
      description: "Awaiting admin approval",
      icon: Clock,
    },
    {
      title: "Total revenue",
      value: formatPrice(revenue),
      description: "From confirmed bookings",
      icon: DollarSign,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Platform overview and key metrics at a glance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {stats.map(({ title, value, description, icon: Icon }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
              <CardDescription>{description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
