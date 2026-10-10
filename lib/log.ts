// 이벤트 로그 전송. 저장소(Supabase 등)가 정해지면 /api/log 라우트에서 연결한다.
export type LogEvent = {
  sid?: string | null; // 세션 ID (챗봇 세션과 연결)
  pid?: string | null; // 참가자 ID
  type?: string | null; // 실험 조건 A/B/C/D
  event: string;
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
