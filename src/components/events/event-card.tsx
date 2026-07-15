import Image from "next/image";
import Link from "next/link";
import { formatDate, formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Users } from "lucide-react";

type EventCardProps = {
  event: {
    id: string;
    title: string;
    description: string;
    location: string;
    date: Date;
    availableSeats: number;
    capacity: number;
    price: number;
    image: string | null;
  };
};

export function EventCard({ event }: EventCardProps) {
  const isSoldOut = event.availableSeats === 0;

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
      <div className="relative aspect-[16/9] bg-muted">
        {event.image ? (
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No image
          </div>
        )}
        {isSoldOut ? (
          <Badge variant="destructive" className="absolute right-3 top-3">
            Sold out
          </Badge>
        ) : (
          <Badge className="absolute right-3 top-3">{formatPrice(event.price)}</Badge>
        )}
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-1">{event.title}</CardTitle>
        <CardDescription className="line-clamp-2">{event.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>{formatDate(event.date)}</p>
        <p className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {event.location}
        </p>
        <p className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          {event.availableSeats} of {event.capacity} seats left
        </p>
      </CardContent>
      <CardFooter className="mt-auto">
        <Link href={`/events/${event.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            View details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
