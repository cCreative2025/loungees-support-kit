import type { SupportKind, SupportState } from "../types";

// 앱마다 색·글꼴이 달라서 블록은 기본값만 두고 theme 로 덮어쓴다
export type SupportTheme = {
  background: string;
  card: string;
  text: string;
  subtext: string;
  border: string;
  primary: string;
  onPrimary: string;
  /** 답장 블록 강조색 */
  reply: string;
  replyBackground: string;
  danger: string;
  radius: number;
  fontFamily?: string;
  fontFamilyBold?: string;
};

export const defaultTheme: SupportTheme = {
  background: "#F4F5F7",
  card: "#FFFFFF",
  text: "#191F28",
  subtext: "#8B95A1",
  border: "#E5E8EB",
  primary: "#3182F6",
  onPrimary: "#FFFFFF",
  reply: "#3182F6",
  replyBackground: "#F2F7FF",
  danger: "#F04452",
  radius: 16,
};

export type SupportStrings = {
  kinds: Record<SupportKind, string>;
  states: Record<SupportState, string>;
  placeholder: Record<SupportKind, string>;
  send: string;
  sending: string;
  sent: string;
  tooShort: string;
  mine: string;
  /** "{name} 답변" */
  replyFrom: (operator: string) => string;
  waiting: string;
  empty: string;
  emptySub: string;
  retry: string;
  loadFailed: string;
};

export const koStrings: SupportStrings = {
  kinds: { inquiry: "문의", feature: "기능 요청", bug: "버그 신고" },
  states: { received: "접수됨", reviewing: "확인 중", answered: "답변 완료", closed: "처리 완료" },
  placeholder: {
    inquiry: "궁금한 점이나 불편한 점을 적어주세요",
    feature: "있었으면 하는 기능을 적어주세요",
    bug: "어떤 화면에서 무엇을 했을 때 문제가 생겼는지 적어주세요",
  },
  send: "보내기",
  sending: "보내는 중…",
  sent: "보냈어요. 답변은 '내 문의'에서 확인할 수 있어요",
  tooShort: "내용을 2자 이상 적어주세요",
  mine: "내 문의",
  replyFrom: (op) => `${op} 답변`,
  waiting: "답변을 기다리는 중이에요",
  empty: "아직 보낸 문의가 없어요",
  emptySub: "궁금한 점이 있으면 언제든 보내주세요",
  retry: "다시 시도",
  loadFailed: "불러오지 못했어요",
};

export const enStrings: SupportStrings = {
  kinds: { inquiry: "Question", feature: "Feature request", bug: "Bug report" },
  states: { received: "Received", reviewing: "In review", answered: "Answered", closed: "Closed" },
  placeholder: {
    inquiry: "Tell us your question or what's bothering you",
    feature: "Describe the feature you'd like",
    bug: "Which screen, what you did, and what went wrong",
  },
  send: "Send",
  sending: "Sending…",
  sent: "Sent! Check replies in My inquiries",
  tooShort: "Please write at least 2 characters",
  mine: "My inquiries",
  replyFrom: (op) => `Reply from ${op}`,
  waiting: "Waiting for a reply",
  empty: "No inquiries yet",
  emptySub: "Send us a message anytime",
  retry: "Retry",
  loadFailed: "Couldn't load",
};
