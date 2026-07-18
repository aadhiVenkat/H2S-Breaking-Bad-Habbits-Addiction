import { describe, expect, it } from "vitest";
import { splitMessageBlocks, tokenizeInline } from "./markdown";

describe("tokenizeInline", () => {
  it("tokenizes bold and italic", () => {
    expect(tokenizeInline("It *will* pass. **Do this now.**")).toEqual([
      { type: "text", value: "It " },
      { type: "italic", value: "will" },
      { type: "text", value: " pass. " },
      { type: "bold", value: "Do this now." },
    ]);
  });

  it("leaves plain text alone", () => {
    expect(tokenizeInline("Hello there")).toEqual([{ type: "text", value: "Hello there" }]);
  });
});

describe("splitMessageBlocks", () => {
  it("splits paragraphs and list items", () => {
    expect(splitMessageBlocks("Stay with it.\n\n- Splash cold water\n- Drink slowly")).toEqual([
      { type: "paragraph", text: "Stay with it." },
      { type: "list", items: ["Splash cold water", "Drink slowly"] },
    ]);
  });
});
