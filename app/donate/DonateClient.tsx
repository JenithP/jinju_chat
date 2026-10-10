"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { logEvent } from "@/lib/log";
import s from "./donate.module.css";

const AMOUNTS = [10000, 30000, 50000, 100000];

const won = (n: number) => n.toLocaleString("ko-KR") + "원";

export default function DonateClient() {
  const params = useSearchParams();
  const ids = { sid: params.get("sid"), pid: params.get("pid"), type: params.get("type") };

  const [kind, setKind] = useState<"정기" | "일시">("정기");
  const [amount, setAmount] = useState<number | null>(30000);
  const [custom, setCustom] = useState("");
  const [done, setDone] = useState(false);

  const finalAmount = amount ?? (Number(custom.replace(/[^0-9]/g, "")) || 0);

  useEffect(() => {
    logEvent({ ...ids, event: "donate_page_view" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function submit() {
    if (finalAmount <= 0) return;
    logEvent({ ...ids, event: "donate_submit", detail: { kind, amount: finalAmount } });
    setDone(true);
  }

  return (
    <div className={s.page}>
      <header className={s.header}>
        <div className={s.brand}>
          <img src="/images/logo-mark.png" alt="" width={36} height={36} />
          <div>
            <strong>기후연대</strong>
            <span>CLIMATE ALLIANCE</span>
          </div>
        </div>
        <nav className={s.nav}>
          <span>단체 소개</span>
          <span>캠페인</span>
          <span>재정 보고</span>
        </nav>
      </header>

      <section className={s.hero}>
        <div className={s.heroInner}>
          <p className={s.eyebrow}>기후난민지원 캠페인</p>
          <h1>
            삶의 터전을 잃은 이웃에게
            <br />
            다시 일어설 힘을
          </h1>
          <p className={s.lead}>
            가뭄과 홍수가 반복되는 기후 재난 취약 지역에서 이재민에게 식수와 식량, 위생, 거처를 지원합니다.
          </p>
          <div className={s.heroStats}>
            <div>
              <b>330만 건+</b>
              <span>2024년 아프리카의 뿔 지역
                <br />
                가뭄·홍수로 인한 이주</span>
            </div>
            <div>
              <b>1,600만 명+</b>
              <span>안전한 식수를
                <br />
                확보하지 못한 사람</span>
            </div>
          </div>
        </div>
      </section>

      <main className={s.main}>
        <div className={s.content}>
          <section className={s.block}>
            <h2>2024년, 후원금은 이렇게 쓰였습니다</h2>
            <ul className={s.useGrid}>
              <li><b>5만 개+</b><span>위생 키트</span></li>
              <li><b>2,000톤</b><span>긴급 식량</span></li>
              <li><b>1만 개</b><span>임시 거주 시설</span></li>
              <li><b>50개</b><span>이동식 진료소</span></li>
            </ul>
            <p className={s.note}>기후재난지역 <b>2만 가구 이상</b>을 지원했습니다.</p>
          </section>

          <section className={s.block}>
            <h2>투명하게 관리합니다</h2>
            <div className={s.trust}>
              <div className={s.ring} style={{ ["--p" as string]: 92 }}>
                <span>92%</span>
              </div>
              <ul>
                <li>전체 후원금의 92%를 현장 사업에 사용</li>
                <li>표준화된 회계 관리 시스템 운영</li>
                <li>매년 독립적인 외부 감사 기관의 회계·재무 검증</li>
                <li>재무보고서 매년 홈페이지 공개</li>
              </ul>
            </div>
          </section>
        </div>

        <aside className={s.formCard} aria-live="polite">
          {done ? (
            <div className={s.done}>
              <img src="/images/logo-mark.png" alt="" width={56} height={56} />
              <h3>후원 신청이 접수되었습니다</h3>
              <p>
                {kind} 후원 {won(finalAmount)}
              </p>
              <p className={s.doneSub}>
                관심 가져 주셔서 감사합니다.
                <br />이 창을 닫고 대화로 돌아가 주세요.
              </p>
            </div>
          ) : (
            <>
              <h3>후원 신청</h3>
              <div className={s.toggle} role="tablist">
                {(["정기", "일시"] as const).map((k) => (
                  <button
                    key={k}
                    role="tab"
                    aria-selected={kind === k}
                    className={kind === k ? s.on : ""}
                    onClick={() => setKind(k)}
                  >
                    {k === "정기" ? "정기 후원 (매월)" : "일시 후원"}
                  </button>
                ))}
              </div>

              <p className={s.label}>후원 금액</p>
              <div className={s.amounts}>
                {AMOUNTS.map((a) => (
                  <button
                    key={a}
                    className={amount === a ? s.on : ""}
                    onClick={() => {
                      setAmount(a);
                      setCustom("");
                    }}
                  >
                    {won(a)}
                  </button>
                ))}
              </div>
              <input
                className={s.custom}
                inputMode="numeric"
                placeholder="직접 입력 (원)"
                value={custom}
                onFocus={() => setAmount(null)}
                onChange={(e) => {
                  setAmount(null);
                  setCustom(e.target.value.replace(/[^0-9]/g, ""));
                }}
              />

              <div className={s.total}>
                <span>{kind === "정기" ? "매월 후원 금액" : "후원 금액"}</span>
                <b>{won(finalAmount)}</b>
              </div>

              <button className={s.cta} disabled={finalAmount <= 0} onClick={submit}>
                후원 신청하기
              </button>
              <p className={s.fine}>후원금은 연말정산 시 기부금 세액공제를 받으실 수 있습니다.</p>
            </>
          )}
        </aside>
      </main>

      <footer className={s.footer}>
        <p>기후연대 · Climate Alliance</p>
        <p className={s.disclaimer}>
          본 페이지는 연구 목적으로 제작된 가상의 페이지이며, 실제 결제나 후원은 이루어지지 않습니다.
        </p>
      </footer>
    </div>
  );
}
