import { describe, expect, it } from "vitest";
import { generateSalt, hashPassword } from "@/lib/auth/hash";

describe("generateSalt", () => {
  it("returns a 32-char hex string", () => {
    const salt = generateSalt();
    expect(salt).toMatch(/^[0-9a-f]{32}$/);
  });

  it("produces unique values", () => {
    expect(generateSalt()).not.toBe(generateSalt());
  });
});

describe("hashPassword", () => {
  it("is deterministic for the same inputs", async () => {
    const a = await hashPassword("ada", "secret", "abcd");
    const b = await hashPassword("ada", "secret", "abcd");
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it("changes when salt or password changes", async () => {
    const base = await hashPassword("ada", "secret", "abcd");
    const differentSalt = await hashPassword("ada", "secret", "efgh");
    const differentPassword = await hashPassword("ada", "other", "abcd");
    expect(differentSalt).not.toBe(base);
    expect(differentPassword).not.toBe(base);
  });
});
