export type StatKind = "kill" | "block" | "ace" | "dig" | "assist" | "error";

export interface StatEvent {
  id: string;
  player: string;
  kind: StatKind;
  setNumber: number;
  timestamp: string; // ISO string
}
