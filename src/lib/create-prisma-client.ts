import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

function getDatabaseUrl() {
  const connectionString = process.env.DATABASE_URL?.trim();

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add a PostgreSQL connection string to your .env file.",
    );
  }

  if (connectionString.startsWith("file:")) {
    throw new Error(
      "DATABASE_URL still points to SQLite (file:...). This project uses PostgreSQL. " +
        "Create a free database at https://neon.tech, copy the connection string, " +
        "and set DATABASE_URL=postgresql://... in your .env file.",
    );
  }

  if (
    !connectionString.startsWith("postgresql://") &&
    !connectionString.startsWith("postgres://")
  ) {
    throw new Error(
      "DATABASE_URL must be a PostgreSQL connection string starting with postgresql:// or postgres://",
    );
  }

  return normalizeDatabaseUrl(connectionString);
}

function normalizeDatabaseUrl(connectionString: string) {
  try {
    const url = new URL(connectionString);
    const sslmode = url.searchParams.get("sslmode");

    if (!sslmode || sslmode === "require" || sslmode === "prefer" || sslmode === "verify-ca") {
      url.searchParams.set("sslmode", "verify-full");
    }

    return url.toString();
  } catch {
    return connectionString;
  }
}

export function createPrismaClient() {
  const connectionString = getDatabaseUrl();
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}
