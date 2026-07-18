import { describe, expect, it, beforeEach } from "vitest";
import type { Request } from "express";
import {
  _resetRateLimitBuckets,
  assertPromptLength,
  assertRateLimit,
  sanitizeInternalHref,
  MAX_PROMPT_CHARS,
} from "./guard.js";
import { AiServerError } from "./errors.js";

function fakeRequest(ip = "1.2.3.4"): Request {
  return {
    headers: { "x-forwarded-for": ip },
    ip: ip,
  } as unknown as Request;
}

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
});

describe("assertPromptLength", () => {
  it("returns trimmed prompts", () => {
    expect(assertPromptLength("  hello  ")).toBe("hello");
  });

  it("rejects empty prompts", () => {
    expect(() => assertPromptLength("   ")).toThrow(AiServerError);
  });

  it("rejects oversized prompts", () => {
    expect(() => assertPromptLength("x".repeat(MAX_PROMPT_CHARS + 1))).toThrow(AiServerError);
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
  });
});
