import { describe, expect, it, beforeEach } from "vitest";
import type { Request } from "express";
import {
  _resetRateLimitBuckets,
  assertJsonBody,
  assertPromptLength,
  assertRateLimit,
  clientKey,
  sanitizeInternalHref,
  MAX_PROMPT_CHARS,
} from "./guard.js";
import { AiServerError } from "./errors.js";

function fakeRequest(overrides: {
  ip?: string;
  forwarded?: string | string[];
  realIp?: string;
} = {}): Request {
  const headers: Record<string, string | string[] | undefined> = {};
  if (overrides.forwarded !== undefined) headers["x-forwarded-for"] = overrides.forwarded;
  if (overrides.realIp !== undefined) headers["x-real-ip"] = overrides.realIp;
  return {
    headers,
    ip: overrides.ip ?? "1.2.3.4",
  } as unknown as Request;
}

describe("clientKey", () => {
  it("uses the first x-forwarded-for hop", () => {
    expect(clientKey(fakeRequest({ forwarded: "9.9.9.9, 8.8.8.8" }))).toBe("9.9.9.9");
  });

  it("falls back to x-real-ip then req.ip", () => {
    expect(clientKey(fakeRequest({ realIp: "7.7.7.7" }))).toBe("7.7.7.7");
    expect(clientKey(fakeRequest({ ip: "5.5.5.5" }))).toBe("5.5.5.5");
  });
});

describe("assertRateLimit", () => {
  beforeEach(() => {
    _resetRateLimitBuckets();
  });

  it("allows requests under the limit", () => {
    expect(() => assertRateLimit(fakeRequest(), 3)).not.toThrow();
    expect(() => assertRateLimit(fakeRequest(), 3)).not.toThrow();
    expect(() => assertRateLimit(fakeRequest(), 3)).not.toThrow();
  });

  it("blocks when the limit is exceeded", () => {
    assertRateLimit(fakeRequest(), 2);
    assertRateLimit(fakeRequest(), 2);
    expect(() => assertRateLimit(fakeRequest(), 2)).toThrow(AiServerError);
  });

  it("tracks clients independently", () => {
    assertRateLimit(fakeRequest({ forwarded: "1.1.1.1" }), 1);
    expect(() => assertRateLimit(fakeRequest({ forwarded: "1.1.1.1" }), 1)).toThrow(AiServerError);
    expect(() => assertRateLimit(fakeRequest({ forwarded: "2.2.2.2" }), 1)).not.toThrow();
  });
});

describe("assertPromptLength", () => {
  it("returns trimmed prompts", () => {
    expect(assertPromptLength("  hello  ")).toBe("hello");
  });

  it("rejects empty prompts", () => {
    expect(() => assertPromptLength("   ")).toThrow(AiServerError);
    expect(() => assertPromptLength(null)).toThrow(AiServerError);
  });

  it("rejects oversized prompts", () => {
    expect(() => assertPromptLength("x".repeat(MAX_PROMPT_CHARS + 1))).toThrow(AiServerError);
  });
});

describe("assertJsonBody", () => {
  it("returns a present body", () => {
    expect(assertJsonBody({ a: 1 })).toEqual({ a: 1 });
  });

  it("rejects nullish bodies", () => {
    expect(() => assertJsonBody(null)).toThrow(AiServerError);
    expect(() => assertJsonBody(undefined)).toThrow(AiServerError);
  });
});

describe("sanitizeInternalHref", () => {
  it("allows relative app paths", () => {
    expect(sanitizeInternalHref("/coach")).toBe("/coach");
    expect(sanitizeInternalHref("/check-in?tab=1")).toBe("/check-in?tab=1");
  });

  it("rejects external and protocol URLs", () => {
    expect(sanitizeInternalHref("https://evil.test")).toBeUndefined();
    expect(sanitizeInternalHref("//evil.test")).toBeUndefined();
    expect(sanitizeInternalHref("javascript:alert(1)")).toBeUndefined();
    expect(sanitizeInternalHref("/path\\escape")).toBeUndefined();
    expect(sanitizeInternalHref(42)).toBeUndefined();
  });
});
