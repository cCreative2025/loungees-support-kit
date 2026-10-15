import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View, type StyleProp, type ViewStyle } from "react-native";
import type { SupportClient } from "../client";
import { SupportError } from "../client";
import type { SupportKind } from "../types";
import { defaultTheme, koStrings, type SupportStrings, type SupportTheme } from "./theme";

type Props = {
  client: SupportClient;
  /** 고를 수 있는 종류 (기본: 문의·기능 요청·버그 신고). 하나만 주면 선택 칩을 숨긴다 */
  kinds?: SupportKind[];
  defaultKind?: SupportKind;
  onSent?: (id: string, kind: SupportKind) => void;
  theme?: Partial<SupportTheme>;
  strings?: Partial<SupportStrings>;
  style?: StyleProp<ViewStyle>;
  maxLength?: number;
};

// 문의 보내기 — 종류 칩 + 여러 줄 입력 + 보내기. 보내면 입력을 비우고 onSent 호출
export function InquiryForm({ client, kinds = ["inquiry", "feature", "bug"], defaultKind, onSent, theme, strings, style, maxLength = 1000 }: Props) {
  const t = { ...defaultTheme, ...theme };
  const s = { ...koStrings, ...strings };
  const [kind, setKind] = useState<SupportKind>(defaultKind ?? kinds[0]);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const font = t.fontFamily ? { fontFamily: t.fontFamily } : null;
  const bold = t.fontFamilyBold ? { fontFamily: t.fontFamilyBold } : { fontWeight: "700" as const };

  async function send() {
    if (body.trim().length < 2) return setMessage({ text: s.tooShort, error: true });
    setBusy(true);
    setMessage(null);
    try {
      const { id } = await client.send({ kind, body: body.trim() });
      setBody("");
      setMessage({ text: s.sent, error: false });
      onSent?.(id, kind);
    } catch (e) {
      setMessage({ text: e instanceof SupportError ? e.message : s.loadFailed, error: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={[styles.wrap, style]}>
      {kinds.length > 1 && (
        <View style={styles.chips}>
          {kinds.map((k) => {
            const on = k === kind;
            return (
              <Pressable
                key={k}
                onPress={() => setKind(k)}
                style={[styles.chip, { borderColor: on ? t.primary : t.border, backgroundColor: on ? t.primary : t.card }]}
              >
                <Text style={[styles.chipText, font, { color: on ? t.onPrimary : t.text }, on && bold]}>{s.kinds[k]}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
      <TextInput
        value={body}
        onChangeText={setBody}
        placeholder={s.placeholder[kind]}
        placeholderTextColor={t.subtext}
        multiline
        maxLength={maxLength}
        textAlignVertical="top"
        style={[styles.input, font, { color: t.text, backgroundColor: t.card, borderColor: t.border, borderRadius: t.radius }]}
      />
      <Text style={[styles.count, font, { color: t.subtext }]}>
        {body.length}/{maxLength}
      </Text>
      {message && <Text style={[styles.message, font, { color: message.error ? t.danger : t.primary }]}>{message.text}</Text>}
      <Pressable
        onPress={send}
        disabled={busy}
        style={({ pressed }) => [styles.button, { backgroundColor: t.primary, borderRadius: t.radius, opacity: busy || pressed ? 0.7 : 1 }]}
      >
        {busy ? <ActivityIndicator color={t.onPrimary} /> : <Text style={[styles.buttonText, bold, { color: t.onPrimary }]}>{s.send}</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  chips: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  chipText: { fontSize: 14 },
  input: { minHeight: 160, borderWidth: 1, padding: 14, fontSize: 15, lineHeight: 22 },
  count: { alignSelf: "flex-end", fontSize: 12, marginTop: -4 },
  message: { fontSize: 13, lineHeight: 19 },
  button: { height: 50, alignItems: "center", justifyContent: "center" },
  buttonText: { fontSize: 16 },
});
