// 2(언어적 단서) x 2(비언어적 단서) 실험 조건. 값은 챗봇제작_독립변수.xlsx / 챗봇제작_스크립트_261001.xlsx 기준.
export type ConditionType = "A" | "B" | "C" | "D";

export type Condition = {
  type: ConditionType;
  verbal: "높음" | "낮음"; // 언어적 단서 인간 유사성
  nonverbal: "높음" | "낮음"; // 비언어적 단서 인간 유사성
  // 언어적 단서
  style: "대화형" | "비대화형";
  person: "1인칭" | "비인칭";
  name: "연우" | "챗봇";
  // 비언어적 단서
  profile: "사람 얼굴" | "조직 로고";
  emoticon: "사용" | "미사용";
  typing: "사용" | "미사용"; // 응답 생성 표시 "작성 중입니다…"
  delay: "사용" | "미사용"; // 응답 지연 (사용 시 2~4초, 미사용 시 즉시)
};

const VERBAL_HIGH = { verbal: "높음", style: "대화형", person: "1인칭", name: "연우" } as const;
const VERBAL_LOW = { verbal: "낮음", style: "비대화형", person: "비인칭", name: "챗봇" } as const;
const NONVERBAL_HIGH = { nonverbal: "높음", profile: "사람 얼굴", emoticon: "사용", typing: "사용", delay: "사용" } as const;
const NONVERBAL_LOW = { nonverbal: "낮음", profile: "조직 로고", emoticon: "미사용", typing: "미사용", delay: "미사용" } as const;

export const CONDITIONS: Record<ConditionType, Condition> = {
  A: { type: "A", ...VERBAL_HIGH, ...NONVERBAL_HIGH },
  B: { type: "B", ...VERBAL_HIGH, ...NONVERBAL_LOW },
  C: { type: "C", ...VERBAL_LOW, ...NONVERBAL_HIGH },
  D: { type: "D", ...VERBAL_LOW, ...NONVERBAL_LOW },
};

export function getCondition(type: string | null | undefined): Condition | null {
  const t = (type ?? "").toUpperCase();
  return t in CONDITIONS ? CONDITIONS[t as ConditionType] : null;
}
