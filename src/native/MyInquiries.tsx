import { useCallback, useEffect, useState, type ReactElement } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import type { SupportClient } from "../client";
import { SupportError } from "../client";
import type { SupportItem } from "../types";
import { defaultTheme, koStrings, type SupportStrings, type SupportTheme } from "./theme";

// 내 문의 목록 상태 — autoLoad 면 마운트 때 1회, 그 외엔 reload() 로만
export function useMyInquiries(client: SupportClient, autoLoad = true) {
  const [items, setItems] = useState<SupportItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const reload = useCallback(async () => {
    setRefreshing(true);
    try {
      setItems(await client.list());
      setError(null);
    } catch (e) {
      setError(e instanceof SupportError ? e.message : String(e));
    } finally {
      setRefreshing(false);
    }
  }, [client]);

  useEffect(() => {
    if (autoLoad) reload();
  }, [autoLoad, reload]);

  return { items, error, refreshing, reload };
}

type Props = {
  client: SupportClient;
  /** 답장 블록 머리말에 쓸 운영자 이름 (예: "키팝", "리뷰톡") */
  operatorName: string;
  theme?: Partial<SupportTheme>;
  strings?: Partial<SupportStrings>;
  locale?: string;
  style?: StyleProp<ViewStyle>;
  ListHeaderComponent?: ReactElement | null;
  /**
   * 화면에 들어올 때마다 불러오려면 넘긴다 (expo-router useFocusEffect 로 1, 2, 3… 증가).
   * 넘기면 마운트 자동 조회는 하지 않고 이 값이 null/undefined 가 아닐 때마다 1회 조회 → 진입당 정확히 1번.
   * 안 넘기면 마운트 때 1회.
   */
  reloadKey?: number | string | null;
};

const fmt = (iso: string, locale: string) =>
  new Date(iso).toLocaleString(locale, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

// 내 문의 — 채팅이 아니라 메일처럼: 내 문의 카드 아래에 답변 블록 (문의만. 업데이트 요청·버그 제보는 보내고 끝)
export function MyInquiries({ client, operatorName, theme, strings, locale = "ko-KR", style, ListHeaderComponent, reloadKey }: Props) {
  const t = { ...defaultTheme, ...theme };
  const s = { ...koStrings, ...strings };
  const managed = reloadKey !== undefined;
  const { items, error, refreshing, reload } = useMyInquiries(client, !managed);
  const font = t.fontFamily ? { fontFamily: t.fontFamily } : null;
  const bold = t.fontFamilyBold ? { fontFamily: t.fontFamilyBold } : { fontWeight: "700" as const };

  useEffect(() => {
    if (reloadKey != null) reload();
  }, [reloadKey, reload]);

  if (!items && !error) {
    return (
      <View style={[styles.center, { backgroundColor: t.background }, style]}>
        <ActivityIndicator color={t.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={[{ backgroundColor: t.background }, style]}
      contentContainerStyle={styles.list}
      data={items ?? []}
      keyExtractor={(i) => i.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={reload} tintColor={t.primary} />}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={
        error ? (
          <View style={styles.center}>
            <Text style={[styles.emptyTitle, bold, { color: t.text }]}>{s.loadFailed}</Text>
            <Text style={[styles.emptySub, font, { color: t.subtext }]}>{error}</Text>
            <Pressable onPress={reload} style={[styles.retry, { borderColor: t.border, borderRadius: t.radius }]}>
              <Text style={[font, { color: t.text }]}>{s.retry}</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.center}>
            <Text style={[styles.emptyTitle, bold, { color: t.text }]}>{s.empty}</Text>
            <Text style={[styles.emptySub, font, { color: t.subtext }]}>{s.emptySub}</Text>
          </View>
        )
      }
      renderItem={({ item }) => (
        <View style={[styles.card, { backgroundColor: t.card, borderRadius: t.radius, borderColor: t.border }]}>
          {/* 내 문의 */}
          <View style={styles.head}>
            <Text style={[styles.headTitle, bold, { color: t.text }]}>{s.mine}</Text>
            <Text style={[styles.badge, font, { color: item.state === "answered" ? t.reply : t.subtext, borderColor: item.state === "answered" ? t.reply : t.border }]}>
              {s.states[item.state]}
            </Text>
          </View>
          <Text style={[styles.date, font, { color: t.subtext }]}>{fmt(item.createdAt, locale)}</Text>
          <Text style={[styles.body, font, { color: t.text }]}>{item.body}</Text>

          {/* 답변 — 메일 답장처럼 아래에 들여서 */}
          {item.reply ? (
            <View style={[styles.reply, { backgroundColor: t.replyBackground, borderLeftColor: t.reply }]}>
              <Text style={[styles.replyHead, bold, { color: t.reply }]}>{s.replyFrom(operatorName)}</Text>
              <Text style={[styles.date, font, { color: t.subtext }]}>{fmt(item.reply.at, locale)}</Text>
              <Text style={[styles.body, font, { color: t.text }]}>{item.reply.text}</Text>
            </View>
          ) : (
            <Text style={[styles.waiting, font, { color: t.subtext, borderTopColor: t.border }]}>{s.waiting}</Text>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 12, flexGrow: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 8 },
  emptyTitle: { fontSize: 16 },
  emptySub: { fontSize: 14, textAlign: "center" },
  retry: { marginTop: 8, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 8 },
  card: { padding: 16, borderWidth: StyleSheet.hairlineWidth },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  headTitle: { fontSize: 15, flexShrink: 1 },
  badge: { fontSize: 12, borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, overflow: "hidden" },
  date: { fontSize: 12, marginTop: 2 },
  body: { fontSize: 15, lineHeight: 22, marginTop: 8 },
  reply: { marginTop: 14, padding: 12, borderLeftWidth: 3, borderRadius: 8 },
  replyHead: { fontSize: 14 },
  waiting: { marginTop: 14, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, fontSize: 13 },
});
