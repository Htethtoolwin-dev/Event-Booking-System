import { describe, expect, it } from "vitest";
import { hashPassword, signToken, verifyPassword, verifyToken } from "@/lib/jwt";

describe("jwt helpers", () => {
  it("hashes and verifies passwords", async () => {
    const hash = await hashPassword("TestPassword123!");
    expect(hash).not.toBe("TestPassword123!");
    expect(await verifyPassword("TestPassword123!", hash)).toBe(true);
    expect(await verifyPassword("WrongPassword", hash)).toBe(false);
  });

  it("signs and verifies JWT tokens", async () => {
    process.env.JWT_SECRET = "test-secret-with-at-least-32-characters";

    const token = await signToken({
      userId: "user-1",
      email: "user@example.com",
      role: "USER",
    });

    const payload = await verifyToken(token);
    expect(payload).toEqual({
      userId: "user-1",
      email: "user@example.com",
      role: "USER",
    });
  });

  it("returns null for invalid tokens", async () => {
    process.env.JWT_SECRET = "test-secret-with-at-least-32-characters";
    const payload = await verifyToken("invalid.token.value");
    expect(payload).toBeNull();
  });
});
