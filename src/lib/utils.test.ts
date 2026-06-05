import { describe, it, expect } from "vitest";
import { cn, safeJsonLd } from "./utils";

describe("cn", () => {
  it("merges classes correctly", () => {
    expect(cn("bg-red-500", "text-white")).toBe("bg-red-500 text-white");
    expect(cn("bg-red-500", { "text-white": true, "hidden": false })).toBe("bg-red-500 text-white");
  });
});

describe("safeJsonLd", () => {
  it("escapes dangerous HTML characters in JSON string", () => {
    const dangerousData = {
      name: "Test </script><script>alert('xss')</script>",
      ampersand: "a & b",
      brackets: "left < and right >",
    };

    const sanitized = safeJsonLd(dangerousData);

    expect(sanitized).not.toContain("</script>");
    expect(sanitized).not.toContain("<script>");
    expect(sanitized).toContain("\\u003c/script\\u003e");
    expect(sanitized).toContain("a \\u0026 b");
    expect(sanitized).toContain("left \\u003c and right \\u003e");

    // Ensure it is still valid JSON
    const parsed = JSON.parse(sanitized);
    expect(parsed.name).toBe("Test </script><script>alert('xss')</script>");
    expect(parsed.ampersand).toBe("a & b");
    expect(parsed.brackets).toBe("left < and right >");
  });
});
