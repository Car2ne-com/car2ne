export type BetaChecklistStatus = "ok" | "problem";

export type BetaChecklistItemDict = {
  id: string;
  title: string;
  expected?: string;
};

export type BetaChecklistSectionDict = {
  id: string;
  title: string;
  note?: string;
  items: BetaChecklistItemDict[];
};

export type BetaChecklistResult = {
  itemId: string;
  status: BetaChecklistStatus;
  note: string | null;
};

export type BetaChecklistResultsByItem = Record<
  string,
  { status: BetaChecklistStatus; note: string }
>;
