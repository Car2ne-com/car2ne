import { describe, expect, it } from "vitest";

import { matchCityNameToComune, type Comune } from "@/lib/importers/comuniMatcher";
import comuniDataset from "@/data/comuni-italiani.json";

const comuni = comuniDataset.comuni as Comune[];

describe("matchCityNameToComune", () => {
  it("matches an exact comune name", () => {
    const result = matchCityNameToComune("Milano", comuni);

    expect(result.status).toBe("MATCH_ESATTO");
    expect(result.comune?.name).toBe("Milano");
  });

  it("strips a parenthesized province suffix before matching", () => {
    const result = matchCityNameToComune("Segrate (Milano)", comuni);

    expect(result.status).toBe("MATCH_ESATTO");
    expect(result.comune?.name).toBe("Segrate");
  });

  it("resolves an English alias to the Italian canonical name", () => {
    const result = matchCityNameToComune("Milan", comuni);

    expect(result.status).toBe("MATCH_ALIAS");
    expect(result.comune?.name).toBe("Milano");
  });

  it("applies an explicit municipality name override (punctuation variant)", () => {
    const result = matchCityNameToComune("Bellaria – Igea Marina", comuni);

    expect(result.status).toBe("MATCH_ALIAS");
    expect(result.comune?.name).toBe("Bellaria-Igea Marina");
  });

  it("applies an explicit frazione -> comune capoluogo override", () => {
    const result = matchCityNameToComune("Tindari", comuni);

    expect(result.status).toBe("MATCH_ALIAS");
    expect(result.comune?.name).toBe("Patti");
  });

  it("flags a nationally ambiguous name with no province hint as AMBIGUO", () => {
    const result = matchCityNameToComune("Livo", comuni);

    expect(result.status).toBe("AMBIGUO");
    expect(result.comune).toBeNull();
    expect(result.candidates).toHaveLength(2);
  });

  it("disambiguates an ambiguous name using a parenthesized province hint", () => {
    const result = matchCityNameToComune("Livo (Trento)", comuni);

    expect(result.status).toBe("MATCH_ESATTO");
    expect(result.comune?.province).toBe("Trento");
  });

  it("returns NON_TROVATO for a name that isn't a real comune", () => {
    const result = matchCityNameToComune("Non È Un Comune Reale", comuni);

    expect(result.status).toBe("NON_TROVATO");
    expect(result.comune).toBeNull();
    expect(result.candidates).toHaveLength(0);
  });
});
