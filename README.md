# 기후연대 실험용 챗봇

2(언어적 단서: 인간 유사성 높음/낮음) × 2(비언어적 단서: 인간 유사성 높음/낮음) 실험용 버튼식 챗봇.

## 접속 URL

| 조건 | 언어적 단서 | 비언어적 단서 | URL |
|---|---|---|---|
| A | 높음 (대화형·1인칭·연우) | 높음 (사람 얼굴·이모티콘·입력 중 점 표시·응답 지연) | `/?type=A&panel_id=[ID]` |
| B | 높음 | 낮음 (조직 로고·즉시 응답) | `/?type=B&panel_id=[ID]` |
| C | 낮음 (비대화형·비인칭·챗봇) | 높음 | `/?type=C&panel_id=[ID]` |
| D | 낮음 | 낮음 | `/?type=D&panel_id=[ID]` |

- `panel_id`: 엠브레인이 넘기는 응답자 ID. 로그의 `pid` 열에 기록된다. (이전 방식의 `pid` 파라미터도 받는다)
- 에이전트 답변이 표시된 뒤 `readWait`초(5·7·10초)가 지나야 다음 질문 버튼이 나타난다. 마지막 답변 뒤에는 5초 후 완료 화면이 나온다. 네 조건 공통.
- 대화가 끝나면 6자리 **완료 코드**와 **설문으로 돌아가기** 버튼이 표시된다. 코드는 설문에 입력하지 않는다(완료 인지용).
- 후원 신청 링크는 새 탭으로 가상의 후원 페이지(`/donate`)를 연다. 실제 결제는 없다.

## 설문 복귀 (엠브레인)

"설문으로 돌아가기" 버튼은 `/return?panel_id=[ID]&status=001` 로 이동하고, 서버가 환경변수 `RETURN_URL` 의 주소로 리디렉션한다.

```
RETURN_URL=http://survey.panel.co.kr/2019/XXXX/m5.asp?panel_id={panel_id}&status={status}
```

- `{panel_id}`, `{status}` 자리에 값이 들어간다. 자리표시자가 없으면 `panel_id`, `status` 쿼리를 덧붙인다.
- 상태값: `001` 완료 / `002` 초과 / `003` 아웃. 현재 챗봇은 완료(`001`)만 보낸다.
- `RETURN_URL` 이 없으면 버튼을 눌렀을 때 "설문 복귀 주소가 아직 설정되지 않았습니다." 가 표시된다.
- 복귀 주소는 쿼리로 받지 않고 환경변수로만 설정한다 (임의 사이트로의 리디렉션 방지).

## 로그 (Google Sheets)

1. 로그를 받을 Google Sheet에서 **확장 프로그램 → Apps Script** 를 열고 `apps-script/Code.gs` 내용을 붙여넣는다.
2. **배포 → 새 배포 → 웹 앱** (실행: 나 / 액세스: 모든 사용자) 로 배포하고 `/exec` 주소를 복사한다.
   - 코드를 수정한 경우 **배포 관리 → 수정 → 새 버전** 으로 재배포해야 반영된다 (주소는 유지).
3. Vercel 프로젝트 **Settings → Environment Variables** 에 `SHEETS_WEBHOOK_URL` = 복사한 주소를 등록하고 재배포한다.

시트의 `log` 탭에 기록되는 이벤트는 두 가지뿐이다.

| event | 언제 | 비고 |
|---|---|---|
| `donate_link_click` | 후원 신청 링크를 누를 때마다 | 대화 종료 후에 눌러도 기록 (detail.after_end = Y) |
| `chat_end` | 대화가 끝났을 때 1회 | donate_clicked = 그때까지 링크 클릭 여부 (Y/N) |

| 열 | 내용 |
|---|---|
| server_ts / client_ts | 서버 수신 시각 / 브라우저 발생 시각 (UTC) |
| code | 완료 코드 = 세션 식별자 (완료 화면에 표시되는 코드) |
| pid | 엠브레인 panel_id |
| type, verbal_cue, nonverbal_cue | 조건과 단서 수준 |
| style, person, name, profile, emoticon, typing, delay | 독립변수별 값 |
| event | donate_link_click / chat_end |
| donate_clicked | Y / N |
| duration_sec | 대화 시작부터 종료까지 걸린 시간(초), chat_end 행에만 |
| detail | 기타 상세 (JSON) |

분석 시 **code 별로 `donate_link_click` 행이 하나라도 있으면 클릭한 것**으로 본다.
(`chat_end`의 donate_clicked 는 종료 시점 기준이라, 종료 후 클릭은 별도 행으로만 남는다.)

## 배포 (Vercel)

1. 이 저장소를 Vercel에서 **Add New → Project → Import** 한다. 프레임워크는 Next.js 자동 인식.
2. 위의 `SHEETS_WEBHOOK_URL`, `RETURN_URL` 환경변수를 등록한다.
3. 이후 `main` 브랜치에 push 하면 자동 배포된다.

## 로컬 실행

```bash
npm install
echo SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/.../exec > .env.local
npm run dev
```

`SHEETS_WEBHOOK_URL`이 없으면 로그는 서버 콘솔에만 출력된다.

## 대본 수정

- 대화 문구, 응답 지연(초), 질문 표시 대기(초): `lib/script.ts`
- 조건별 독립변수 값: `lib/conditions.ts`
- 이미지: `public/images/` (profile-person.jpg, profile-logo.png, emoji-greeting.gif, emoji-thanks.gif)
