# 기후연대 실험용 챗봇

2(언어적 단서: 인간 유사성 높음/낮음) × 2(비언어적 단서: 인간 유사성 높음/낮음) 실험용 버튼식 챗봇.

## 접속 URL

| 조건 | 언어적 단서 | 비언어적 단서 | URL |
|---|---|---|---|
| A | 높음 (대화형·1인칭·연우) | 높음 (사람 얼굴·이모티콘·작성 중 표시·응답 지연) | `/?type=A&pid=참가자ID` |
| B | 높음 | 낮음 (조직 로고·즉시 응답) | `/?type=B&pid=참가자ID` |
| C | 낮음 (비대화형·비인칭·챗봇) | 높음 | `/?type=C&pid=참가자ID` |
| D | 낮음 | 낮음 | `/?type=D&pid=참가자ID` |

- `pid`는 선택. Qualtrics에서 넘길 경우 `pid=${e://Field/ResponseID}` 형태로 붙인다.
- 대화가 끝나면 6자리 **완료 코드**가 표시된다. 참가자는 이 코드를 설문에 입력하고 창을 닫는다.
- 후원 신청 링크는 새 탭으로 가상의 후원 페이지(`/donate`)를 연다. 실제 결제는 없다.

## 로그 (Google Sheets)

1. 로그를 받을 Google Sheet에서 **확장 프로그램 → Apps Script** 를 열고 `apps-script/Code.gs` 내용을 붙여넣는다.
2. **배포 → 새 배포 → 웹 앱** (실행: 나 / 액세스: 모든 사용자) 로 배포하고 `/exec` 주소를 복사한다.
   - 코드를 수정한 경우 **배포 관리 → 수정 → 새 버전** 으로 재배포해야 반영된다 (주소는 유지).
3. Vercel 프로젝트 **Settings → Environment Variables** 에 `SHEETS_WEBHOOK_URL` = 복사한 주소를 등록하고 재배포한다.

시트의 `log` 탭에 한 이벤트당 한 행이 쌓인다.

| 열 | 내용 |
|---|---|
| server_ts / client_ts | 서버 수신 시각 / 브라우저 발생 시각 (UTC) |
| sid | 세션 ID (새로고침하면 새 세션) |
| pid | 참가자 ID |
| type, verbal_cue, nonverbal_cue | 조건과 단서 수준 |
| style, person, name, profile, emoticon, typing, delay | 독립변수별 값 |
| event | 아래 이벤트 종류 |
| detail | 이벤트별 상세 (JSON) |

이벤트 종류: `session_start`, `agent_message`, `user_click`(detail.rt_ms = 버튼이 나타난 뒤 클릭까지 걸린 ms), `donate_link_click`, `donate_page_view`, `donate_submit`(정기/일시, 금액), `tab_hidden` / `tab_visible`, `chat_end`(detail.code = 완료 코드, duration_ms), `code_copy`.

## 배포 (Vercel)

1. 이 저장소를 Vercel에서 **Add New → Project → Import** 한다. 프레임워크는 Next.js 자동 인식.
2. 위의 `SHEETS_WEBHOOK_URL` 환경변수를 등록한다.
3. 이후 `main` 브랜치에 push 하면 자동 배포된다.

## 로컬 실행

```bash
npm install
echo SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/.../exec > .env.local
npm run dev
```

`SHEETS_WEBHOOK_URL`이 없으면 로그는 서버 콘솔에만 출력된다.

## 대본 수정

- 대화 문구와 응답 지연(초): `lib/script.ts`
- 조건별 독립변수 값: `lib/conditions.ts`
- 이미지: `public/images/` (profile-person.jpg, profile-logo.png, emoji-greeting.gif)
