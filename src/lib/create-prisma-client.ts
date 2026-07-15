import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";

function cleanEnvValue(value: string | undefined) {
  return value?.trim().replace(/^["']|["']$/g, "");
}

function getDatabaseUrl() {
  const connectionString = cleanEnvValue(process.env.DATABASE_URL);

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add a PostgreSQL connection string in Vercel Environment Variables.",
    );
  }

  if (connectionString.startsWith("file:")) {
    throw new Error(
      "DATABASE_URL still points to SQLite (file:...). Use a Neon PostgreSQL connection string instead.",
    );
  }

  if (
    !connectionString.startsWith("postgresql://") &&
    !connectionString.startsWith("postgres://")
  ) {
    throw new Error(
      "DATABASE_URL must start with postgresql:// or postgres://. Do not wrap the value in quotes on Vercel.",
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
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}
