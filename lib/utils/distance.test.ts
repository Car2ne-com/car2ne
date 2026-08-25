import { describe, expect, it } from "vitest";

import { haversineKm } from "@/lib/utils/distance";

describe("haversineKm", () => {
  it("returns 0 for identical coordinates", () => {
    expect(haversineKm(45.4642, 9.19, 45.4642, 9.19)).toBe(0);
  });

  it("approximates the known straight-line distance between Milano and Roma", () => {
    // Duomo di Milano -> Colosseo, ~477 km great-circle.
    const km = haversineKm(45.4642, 9.19, 41.8902, 12.4922);

    expect(km).toBeGreaterThan(470);
    expect(km).toBeLessThan(485);
  });
});
