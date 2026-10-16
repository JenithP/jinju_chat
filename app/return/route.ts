import { NextResponse } from "next/server";

// 엠브레인 사후 설문으로 복귀시킨다.
// 복귀 주소는 환경변수 RETURN_URL 로만 설정한다 (쿼리로 받지 않아 다른 사이트로의 리디렉션 악용을 막는다).
// 예: RETURN_URL=http://survey.panel.co.kr/2019/XXXX/m5.asp?panel_id={panel_id}&status={status}
// {panel_id}, {status} 자리표시자가 없으면 쿼리 파라미터로 덧붙인다.

// 001 완료 / 002 초과 / 003 아웃
const STATUSES = new Set(["001", "002", "003"]);

export function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const panelId = q.get("panel_id") ?? "";
  const status = STATUSES.has(q.get("status") ?? "") ? q.get("status")! : "001";

  const template = process.env.RETURN_URL;
  if (!template) {
    return new NextResponse("설문 복귀 주소가 아직 설정되지 않았습니다.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  let target: string;
  if (template.includes("{panel_id}") || template.includes("{status}")) {
    target = template
      .replaceAll("{panel_id}", encodeURIComponent(panelId))
      .replaceAll("{status}", status);
  } else {
    const url = new URL(template);
    url.searchParams.set("panel_id", panelId);
    url.searchParams.set("status", status);
    target = url.toString();
  }
  return NextResponse.redirect(target, 302);
}
