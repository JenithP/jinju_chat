import { NextResponse } from "next/server";
import { getCondition } from "@/lib/conditions";

// 클라이언트 이벤트에 실험 조건(독립변수 값)을 붙여 Google Sheets 웹앱으로 전달한다.
// 웹앱 주소는 환경변수 SHEETS_WEBHOOK_URL 로 설정 (로컬: .env.local, 배포: Vercel 환경변수).
export async function POST(req: Request) {
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(await req.text());
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const c = getCondition(data.type as string | undefined);
  const detail = (data.detail ?? {}) as Record<string, unknown>;
  const row = {
    server_ts: new Date().toISOString(),
    client_ts: data.ts ?? "",
    code: data.code ?? "",
    pid: data.pid ?? "",
    type: c?.type ?? String(data.type ?? ""),
    verbal_cue: c?.verbal ?? "",
    nonverbal_cue: c?.nonverbal ?? "",
    style: c?.style ?? "",
    person: c?.person ?? "",
    name: c?.name ?? "",
    profile: c?.profile ?? "",
    emoticon: c?.emoticon ?? "",
    typing: c?.typing ?? "",
    delay: c?.delay ?? "",
    event: data.event ?? "",
    donate_clicked: detail.donate_clicked ?? (data.event === "donate_link_click" ? "Y" : ""),
    duration_sec: detail.duration_sec ?? "",
    detail: Object.keys(detail).length ? JSON.stringify(detail) : "",
  };

  const url = process.env.SHEETS_WEBHOOK_URL;
  if (!url) {
    console.log("[log:no-webhook]", JSON.stringify(row));
    return NextResponse.json({ ok: true, stored: false });
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(row),
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`webhook ${res.status}`);
  } catch (err) {
    console.error("[log:error]", err, JSON.stringify(row));
    return NextResponse.json({ ok: false }, { status: 502 });
  }
  return NextResponse.json({ ok: true, stored: true });
}
