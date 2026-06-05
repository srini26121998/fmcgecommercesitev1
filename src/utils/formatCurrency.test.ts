import { describe, it, expect } from "vitest";
import { formatCurrency } from "./formatCurrency";

describe("formatCurrency", () => {
  it("formats integer amounts correctly", () => {
    const result = formatCurrency(1250).replace(/\s/g, " ");
    expect(result).toContain("1,250");
    expect(result).toContain("₹");
  });

  it("formats decimal amounts correctly", () => {
    const result = formatCurrency(99.5).replace(/\s/g, " ");
    expect(result).toContain("99.50");
    expect(result).toContain("₹");
  });

  it("handles compact option", () => {
    expect(formatCurrency(120000, { compact: true })).toBe("₹1.2L");
    expect(formatCurrency(5400, { compact: true })).toBe("₹5.4K");
  });
});
