import { describe, expect, it } from "vitest";

import { slugify } from "@/lib/utils/slug";

describe("slugify", () => {
  it("lowercases and strips diacritics", () => {
    expect(slugify("Città")).toBe("citta");
  });

  it("replaces runs of non-alphanumeric characters with a single dash", () => {
    expect(slugify("Teatro Greco di Tindari")).toBe(
      "teatro-greco-di-tindari"
    );
  });

  it("trims leading and trailing dashes", () => {
    expect(slugify("  Segrate (Milano)  ")).toBe("segrate-milano");
  });

  it("collapses multiple separators into one dash", () => {
    expect(slugify("Nago - Torbole  sul Garda")).toBe(
      "nago-torbole-sul-garda"
    );
  });
});
