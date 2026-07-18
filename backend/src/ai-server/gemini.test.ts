import { describe, expect, it } from "vitest";
import { extractCandidateText } from "./gemini.js";

describe("extractCandidateText", () => {
  it("skips thought parts and returns the answer", () => {
    const text = extractCandidateText({
      candidates: [
        {
          content: {
            parts: [
              { text: 'Drafting {"summary"}…', thought: true },
              { text: '{"summary":"ok","guidance":"rest"}' },
            ],
          },
        },
      ],
    });
    expect(text).toBe('{"summary":"ok","guidance":"rest"}');
  });

  it("falls back to concatenated text when only thought parts exist", () => {
    const text = extractCandidateText({
      candidates: [
        {
          content: {
            parts: [{ text: '{"a":1}', thought: true }],
          },
        },
      ],
    });
    expect(text).toBe('{"a":1}');
  });
});
