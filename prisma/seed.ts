import bcrypt from "bcryptjs";
import "dotenv/config";
import { createPrismaClient } from "../src/lib/create-prisma-client";
import { Role } from "../src/generated/prisma/client";

const prisma = createPrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("Admin123!", 12);

  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@example.com",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const demoUserPassword = await bcrypt.hash("User123!", 12);

  await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      name: "Demo User",
      email: "user@example.com",
      password: demoUserPassword,
      role: Role.USER,
    },
  });

  const events = [
    {
      title: "Summer Music Festival",
      description:
        "An outdoor music festival featuring top artists across pop, rock, and electronic genres. Food trucks and art installations included.",
      location: "Central Park, New York",
      date: new Date("2026-08-15T18:00:00.000Z"),
      capacity: 500,
      availableSeats: 500,
      price: 89.99,
      image:
        "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80",
    },
    {
      title: "Tech Innovation Summit",
      description:
        "Join industry leaders for talks on AI, cloud computing, and the future of software development. Networking sessions included.",
      location: "Convention Center, San Francisco",
      date: new Date("2026-09-20T09:00:00.000Z"),
      capacity: 300,
      availableSeats: 300,
      price: 149.99,
      image:
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    },
    {
      title: "Food & Wine Expo",
      description:
        "Sample cuisines from around the world paired with fine wines. Live cooking demonstrations by celebrity chefs.",
      location: "Downtown Hall, Chicago",
      date: new Date("2026-10-05T12:00:00.000Z"),
      capacity: 200,
      availableSeats: 200,
      price: 59.99,
      image:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    },
    {
      title: "Startup Pitch Night",
      description:
        "Watch emerging startups pitch their ideas to investors. Open networking after the presentations.",
      location: "Innovation Hub, Austin",
      date: new Date("2026-11-12T17:30:00.000Z"),
      capacity: 150,
      availableSeats: 150,
      price: 25.0,
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
    },
    {
      title: "Wellness Retreat Weekend",
      description:
        "A two-day retreat focused on mindfulness, yoga, and holistic wellness practices led by certified instructors.",
      location: "Lakeview Resort, Denver",
      date: new Date("2026-12-01T08:00:00.000Z"),
      capacity: 80,
      availableSeats: 80,
      price: 199.99,
      image:
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
    },
  ];

  for (const event of events) {
    const existing = await prisma.event.findFirst({
      where: { title: event.title },
    });

    if (!existing) {
      await prisma.event.create({ data: event });
    }
  }

  console.log("Seed completed successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
