export type SupportKind = "inquiry" | "feature" | "bug";

/** received 접수됨 · reviewing 확인 중 · answered 답변 완료 · closed 처리 완료(답장 없이) */
export type SupportState = "received" | "reviewing" | "answered" | "closed";

export type SupportItem = {
  id: string;
  kind: SupportKind;
  body: string;
  createdAt: string;
  state: SupportState;
  reply: { text: string; at: string } | null;
};
