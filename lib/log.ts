// 이벤트 로그 전송. /api/log 가 실험 조건을 붙여 Google Sheets 로 넘긴다.
export type LogEvent = {
  code: string; // 완료 코드 (세션 식별자 겸 설문 매칭용)
  pid?: string | null; // 참가자 ID
  type?: string | null; // 실험 조건 A/B/C/D
  event: "donate_link_click" | "chat_end";
  detail?: Record<string, unknown>;
};

export function logEvent(e: LogEvent) {
  const body = JSON.stringify({ ...e, ts: new Date().toISOString() });
  try {
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon("/api/log", new Blob([body], { type: "application/json" }));
      return;
    }
    fetch("/api/log", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true });
  } catch {
    // 로그 실패가 화면 동작을 막지 않도록 무시
  }
}
