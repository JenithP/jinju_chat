// 대화 스크립트. 출처: 챗봇제작_스크립트_261016.xlsx
// - delay: 비언어적 단서 '높음' 조건에서의 응답 지연(초). '낮음' 조건은 즉시 응답.
// - readWait: 에이전트 답변이 모두 표시된 뒤 다음 User 질문 버튼이 나타나기까지의 대기(초). 네 조건 공통.
//   마지막 스텝은 완료 화면이 표시되기까지의 대기.
// - {{LINK}}: 후원 신청 페이지 링크로 치환된다.
// - emoticon: 비언어적 단서 '높음' 조건에서 해당 메시지 뒤에 붙이는 이모티콘 (환영 인사 / 감사).

export type AgentMsg = { text: string; delay: number; emoticon?: "greeting" | "thanks" };
export type Step = { id: string; user?: string; agent: AgentMsg[]; readWait: number };

type Script = { high: Step[]; low: Step[] };

const USER = {
  org: "기후연대가 어떤 단체인지 알고 싶어요.",
  campaign: "그렇군요. 기후난민지원 캠페인은 무엇인가요?",
  situation: "그 지역의 상황이 얼마나 심각한가요?",
  usage: "후원금은 어디에 사용되나요?",
  manage: "후원금이 어떻게 관리되는지 알 수 있나요?",
  apply: "후원 신청 방법을 알려주세요.",
  thanks: "알겠습니다. 감사합니다.",
  no: "아니요. 없습니다.",
};

export const SCRIPT: Script = {
  // 언어적 단서: 인간 유사성 높음 (대화형 · 1인칭 · 연우)
  high: [
    {
      id: "greeting",
      readWait: 5,
      agent: [
        { text: "안녕하세요! 기후연대에 방문해 주셔서 감사합니다.", delay: 3, emoticon: "greeting" },
        { text: "저는 안내를 도와드릴 챗봇 연우예요.\n무엇을 도와드릴까요?", delay: 3 },
      ],
    },
    {
      id: "org",
      readWait: 7,
      user: USER.org,
      agent: [
        {
          text: "네, 저희 기후연대에 관심 가져 주셔서 감사합니다.\n기후연대는 기후 변화로 삶의 터전을 잃은 이재민에게 인도적 지원을 제공하는 비영리단체예요.",
          delay: 3,
        },
      ],
    },
    {
      id: "campaign",
      readWait: 10,
      user: USER.campaign,
      agent: [
        {
          text: "기후난민지원 캠페인은 기후연대의 주요 사업이에요.\n저희는 이 캠페인을 통해 아프리카의 뿔(Horn of Africa)처럼 기후 난민이 많이 발생하는 기후 재난 취약 지역에 지원을 제공하고 있어요. 2024년에는 해당 지역에서 가뭄과 홍수로 인해 330만 건 이상의 이주가 발생해, 긴급한 도움이 필요한 지역을 중심으로 구호 활동을 진행하고 있어요.",
          delay: 4,
        },
      ],
    },
    {
      id: "situation",
      readWait: 10,
      user: USER.situation,
      agent: [
        {
          text: "가뭄과 홍수 같은 기후 재난이 반복되면서 이재민에게 필요한 식수와 식량, 위생 시설이 매우 부족한 상황이에요. 현재 1,600만 명 이상이 안전한 식수를 확보하지 못하고 있는 것으로 보고되고 있어요. 안타깝게도 많은 이재민이 기본적인 생활을 유지하는 데도 어려움을 겪고 있어요.",
          delay: 4,
        },
      ],
    },
    {
      id: "usage",
      readWait: 10,
      user: USER.usage,
      agent: [
        {
          text: "저희는 전 세계 기후 난민을 위한 구호 활동에 후원금을 사용하고 있어요. 2024년에는 후원금으로 5만 개 이상의 위생 키트와 2,000톤의 긴급 식량을 지원했고, 1만 개의 임시 거주 시설과 50개의 이동식 진료소를 마련했어요. 이를 통해 기후 재난 지역의 2만 가구 이상을 지원할 수 있었어요.",
          delay: 4,
        },
      ],
    },
    {
      id: "manage",
      readWait: 10,
      user: USER.manage,
      agent: [
        {
          text: "네, 궁금하실 수 있는 부분이에요. 제가 후원금 관리 방식에 대해 설명해 드릴게요.\n저희는 표준화된 회계 관리 시스템을 운영하고 있어요. 전체 후원금의 92%가 현장 사업에 사용되고 있고, 매년 독립적인 외부 감사 기관을 통해 회계 및 재무 내역을 검증받고 있어요. 재무보고서는 매년 홈페이지에 공개하고 있으니 직접 확인하실 수 있어요.",
          delay: 4,
        },
      ],
    },
    {
      id: "apply",
      readWait: 7,
      user: USER.apply,
      agent: [
        {
          text: "네, 저희 공식 웹사이트에서 언제든지 후원을 신청하실 수 있어요. [{{LINK}}]를 클릭하시면 후원 신청 페이지로 이동할 수 있어요.",
          delay: 3,
        },
      ],
    },
    {
      id: "thanks",
      readWait: 5,
      user: USER.thanks,
      agent: [{ text: "네, 감사합니다. 더 궁금한 점이 있으신가요?", delay: 2 }],
    },
    {
      id: "end",
      readWait: 5,
      user: USER.no,
      agent: [{ text: "문의해 주셔서 감사합니다. 대화를 종료할게요.", delay: 2, emoticon: "thanks" }],
    },
  ],

  // 언어적 단서: 인간 유사성 낮음 (비대화형 · 비인칭 · 챗봇)
  low: [
    {
      id: "greeting",
      readWait: 5,
      agent: [
        { text: "기후연대의 기후난민지원 캠페인 안내 페이지입니다.", delay: 3, emoticon: "greeting" },
        { text: "이 챗봇은 자동 응답 시스템으로 운영됩니다.\n문의 내용을 입력해주십시오.", delay: 3 },
      ],
    },
    {
      id: "org",
      readWait: 7,
      user: USER.org,
      agent: [{ text: "[기후연대란]\n• 기후 변화로 삶의 터전을 잃은 이재민에게 인도적 지원을 제공하는 비영리단체", delay: 3 }],
    },
    {
      id: "campaign",
      readWait: 10,
      user: USER.campaign,
      agent: [
        {
          text: "[기후난민지원 캠페인]\n• 기후연대의 주요 사업\n• 아프리카의 뿔(Horn of Africa) 등 기후 난민이 많이 발생하는 기후 재난 취약 지역에 지원 제공\n• 2024년 해당 지역의 가뭄·홍수로 330만 건 이상 이주 발생, 긴급한 도움이 필요한 지역 중심으로 구호 활동 진행",
          delay: 4,
        },
      ],
    },
    {
      id: "situation",
      readWait: 10,
      user: USER.situation,
      agent: [
        {
          text: "[기후 재난 지역 상황]\n• 가뭄·홍수 등 기후 재난 반복\n• 이재민에게 필요한 식수, 식량, 위생 시설 매우 부족\n• 현재 1,600만 명 이상 안전한 식수 확보하지 못함\n• 많은 이재민이 기본적인 생활 유지에 어려움",
          delay: 4,
        },
      ],
    },
    {
      id: "usage",
      readWait: 10,
      user: USER.usage,
      agent: [
        {
          text: "[후원금 사용]\n• 전 세계 기후 난민을 위한 구호 활동에 사용\n• 2024년 기준\n  - 위생 키트 5만 개 이상\n  - 긴급 식량 2,000톤\n  - 임시 거주 시설 1만 개\n  - 이동식 진료소 50개\n  - 기후 재난 지역 2만 가구 이상 지원",
          delay: 4,
        },
      ],
    },
    {
      id: "manage",
      readWait: 10,
      user: USER.manage,
      agent: [
        {
          text: "[후원금 관리]\n• 표준화된 회계 관리 시스템 운영\n• 전체 후원금의 92% 현장 사업에 사용\n• 매년 독립적인 외부 감사 기관을 통한 회계 및 재무 내역 검증\n• 재무보고서 매년 홈페이지 공개",
          delay: 4,
        },
      ],
    },
    {
      id: "apply",
      readWait: 7,
      user: USER.apply,
      agent: [{ text: "[후원 안내]\n• 공식 웹사이트에서 상시 후원 신청 가능\n{{LINK}}", delay: 3 }],
    },
    {
      id: "thanks",
      readWait: 5,
      user: USER.thanks,
      agent: [{ text: "추가 문의사항이 있습니까?", delay: 2 }],
    },
    {
      id: "end",
      readWait: 5,
      user: USER.no,
      agent: [{ text: "대화를 종료합니다.", delay: 2, emoticon: "thanks" }],
    },
  ],
};

export const LINK_LABEL = { high: "▶후원 신청 바로가기", low: "▶ 후원 신청 바로가기" };
