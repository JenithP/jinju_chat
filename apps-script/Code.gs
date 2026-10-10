// 챗봇 실험 로그 수신용 Google Apps Script
// 시트 > 확장 프로그램 > Apps Script 에 붙여넣고
// 배포 > 새 배포 > 웹 앱 (실행: 나, 액세스: 모든 사용자) 로 배포한 뒤
// 나온 /exec 주소를 Vercel 환경변수 SHEETS_WEBHOOK_URL 에 넣는다.

const SHEET_NAME = "log";
const HEADERS = [
  "server_ts", "client_ts", "sid", "pid", "type",
  "verbal_cue", "nonverbal_cue", "style", "person", "name",
  "profile", "emoticon", "typing", "delay",
  "event", "detail",
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
    }
    sheet.appendRow(HEADERS.map((h) => (data[h] === undefined ? "" : data[h])));
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput("ok");
}
