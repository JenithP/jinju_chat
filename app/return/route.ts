import { NextResponse } from "next/server";

// 엠브레인 사후 설문으로 복귀시킨다.
// 복귀 주소는 코드의 기본값 또는 환경변수 RETURN_URL 로만 설정한다
// (쿼리로 받지 않아 다른 사이트로의 리디렉션 악용을 막는다).
// {panel_id}, {status} 자리에 값이 들어간다. 자리표시자가 둘 다 없으면 쿼리 파라미터로 덧붙인다.
// 엠브레인 안내: 완료 외 종료 상태가 없어 status 는 넘기지 않는다.
const DEFAULT_RETURN_URL = "https://survey.panel.co.kr/2026/154736/m11.asp?panel_id={panel_id}";

// 001 완료 / 002 초과 / 003 아웃
const STATUSES = new Set(["001", "002", "003"]);

export function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const panelId = q.get("panel_id") ?? "";
  const status = STATUSES.has(q.get("status") ?? "") ? q.get("status")! : "001";

  const template = process.env.RETURN_URL || DEFAULT_RETURN_URL;

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
