import { describe, it, expect } from "vitest";
import { calculateDiscount, formatDiscount, isDeal } from "./calculateDiscount";

describe("calculateDiscount", () => {
  it("calculates positive discount correctly", () => {
    expect(calculateDiscount(150, 200)).toEqual({ amount: 50, percentage: 25 });
  });

  it("handles zero discount or invalid price", () => {
    expect(calculateDiscount(100, 100)).toEqual({ amount: 0, percentage: 0 });
    expect(calculateDiscount(150, 120)).toEqual({ amount: 0, percentage: 0 });
    expect(calculateDiscount(100, 0)).toEqual({ amount: 0, percentage: 0 });
  });
});

describe("formatDiscount", () => {
  it("formats discount percentage correctly", () => {
    expect(formatDiscount(25)).toBe("25% OFF");
    expect(formatDiscount(0)).toBeUndefined();
    expect(formatDiscount(-5)).toBeUndefined();
  });
});

describe("isDeal", () => {
  it("returns true for discount >= 30%", () => {
    expect(isDeal(30)).toBe(true);
    expect(isDeal(35)).toBe(true);
    expect(isDeal(29)).toBe(false);
  });
});
