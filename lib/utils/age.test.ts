import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { calculateAge } from "@/lib/utils/age";

describe("calculateAge", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null for an empty string", () => {
    expect(calculateAge("")).toBeNull();
  });

  it("returns null for an unparseable date", () => {
    expect(calculateAge("not-a-date")).toBeNull();
  });

  it("counts a full year once the birthday has passed this year", () => {
    expect(calculateAge("2000-01-01")).toBe(26);
  });

  it("does not count this year until the birthday has occurred", () => {
    expect(calculateAge("2000-12-31")).toBe(25);
  });

  it("turns the new age exactly on the birthday", () => {
    expect(calculateAge("2000-06-15")).toBe(26);
  });
});
