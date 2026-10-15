// 라운지스 오피스 Support API 클라이언트 (React·React Native·웹 공용, UI 없음)
//
//   const support = createSupportClient({
//     app: "keypop",                                   // 오피스 office_apps.id (support_enabled 인 앱)
//     storage: AsyncStorage,                           // getItem/setItem — 설치별 토큰 보관
//     random: (n) => Crypto.getRandomBytes(n),         // expo-crypto 등. 없으면 crypto.getRandomValues
//     appVersion: Constants.expoConfig?.version,
//     platform: Platform.OS,
//   });
//   await support.send({ kind: "inquiry", body: "..." });
//   const items = await support.list();               // 내 문의 + 오피스 답장

import type { SupportItem, SupportKind } from "./types";

export const DEFAULT_ENDPOINT = "https://yhlepjjhwmvylmcefrby.supabase.co/functions/v1/support";

export type SupportStorage = {
  getItem: (key: string) => Promise<string | null> | string | null;
  setItem: (key: string, value: string) => Promise<void> | void;
};

export type SupportClientOptions = {
  app: string;
  storage: SupportStorage;
  endpoint?: string;
  random?: (bytes: number) => Uint8Array;
  appVersion?: string | null;
  platform?: string | null;
  /** 앱에 로그인이 있으면 사용자 id (오피스에서 누구인지 알아보는 힌트, 앞 8자만 표시) */
  userId?: () => string | null | undefined;
};

export class SupportError extends Error {
  constructor(public code: string, message: string, public status?: number) {
    super(message);
  }
}

export type SupportClient = {
  app: string;
  send: (input: { kind: SupportKind; body: string }) => Promise<{ id: string }>;
  list: () => Promise<SupportItem[]>;
};

function randomToken(random?: (n: number) => Uint8Array) {
  let bytes: Uint8Array;
  if (random) bytes = random(32);
  else if (typeof globalThis.crypto?.getRandomValues === "function") bytes = globalThis.crypto.getRandomValues(new Uint8Array(32));
  else throw new Error("support-kit: 난수 함수가 없어요 — createSupportClient({ random }) 에 expo-crypto 의 getRandomBytes 를 넘겨주세요");
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function createSupportClient(o: SupportClientOptions): SupportClient {
  const endpoint = o.endpoint ?? DEFAULT_ENDPOINT;
  const key = `loungees-support-token:${o.app}`;
  let token: string | null = null;

  // 설치별 비밀 토큰 — 처음 한 번 만들어 저장. 앱을 지우면 내 문의 내역도 함께 사라진다
  async function getToken() {
    if (token) return token;
    token = (await o.storage.getItem(key)) || null;
    if (!token) {
      token = randomToken(o.random);
      await o.storage.setItem(key, token);
    }
    return token;
  }

  async function call<T>(payload: Record<string, unknown>): Promise<T> {
    let res: Response;
    try {
      res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ app: o.app, token: await getToken(), ...payload }),
      });
    } catch {
      throw new SupportError("network", "인터넷 연결을 확인해 주세요");
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new SupportError(data.error ?? "server", data.message ?? "잠시 후 다시 시도해 주세요", res.status);
    return data as T;
  }

  return {
    app: o.app,
    async send({ kind, body }) {
      return call<{ id: string }>({
        op: "create",
        kind,
        body,
        appVersion: o.appVersion ?? null,
        platform: o.platform ?? null,
        userId: o.userId?.() ?? null,
      });
    },
    async list() {
      const data = await call<{ items: SupportItem[] }>({ op: "list" });
      return data.items;
    },
  };
}
