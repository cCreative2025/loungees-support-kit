/**
 * @loungees/support-kit — 라운지스 앱 공용 문의 블록
 *
 * 설치:   npm i github:cCreative2025/loungees-support-kit
 * 오피스: office_apps.support_enabled = true 인 앱만 문의를 받는다 (새 앱은 오피스에서 켜기)
 *
 * 1) 클라이언트 (UI 없음)
 *    import { createSupportClient } from "@loungees/support-kit";
 *
 * 2) React Native 화면 블록
 *    import { InquiryForm, MyInquiries } from "@loungees/support-kit/native";
 *    <InquiryForm client={support} onSent={() => router.push("/my-inquiries")} />
 *    <MyInquiries client={support} operatorName="키팝" reloadKey={focusCount} />  // 진입마다 1회 + 당겨서 새로고침
 *      (expo-router: const [n, setN] = useState<number | null>(null); useFocusEffect(useCallback(() => setN((x) => (x ?? 0) + 1), [])))
 *    색·글꼴은 theme, 문구는 strings 로 앱에 맞춘다.
 */
export * from "./types";
export * from "./client";
