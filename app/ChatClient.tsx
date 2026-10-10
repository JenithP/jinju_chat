"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getCondition } from "@/lib/conditions";
import { LINK_LABEL, SCRIPT, type AgentMsg } from "@/lib/script";
import { logEvent } from "@/lib/log";
import s from "./chat.module.css";

type Item =
  | { kind: "agent"; text: string }
  | { kind: "emoticon" }
  | { kind: "user"; text: string };

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const makeCode = () =>
  Array.from(crypto.getRandomValues(new Uint32Array(6)), (n) => CODE_CHARS[n % CODE_CHARS.length]).join("");

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function ChatClient() {
  const params = useSearchParams();
  const cond = getCondition(params.get("type"));
  const pid = params.get("pid");

  const [sid] = useState(() => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now())));
  const [items, setItems] = useState<Item[]>([]);
  const [typing, setTyping] = useState(false);
  const [stepIdx, setStepIdx] = useState(0); // 마지막으로 재생한 스텝
  const [waiting, setWaiting] = useState(true); // 에이전트 응답 재생 중
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const started = useRef(false);
  const startedAt = useRef(0);
  const optionsShownAt = useRef(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  const steps = cond ? SCRIPT[cond.verbal === "높음" ? "high" : "low"] : [];
  const ids = { sid, pid, type: cond?.type ?? params.get("type") };
  const humanLike = cond?.nonverbal === "높음";
  const name = cond?.name ?? "";
  const profile = humanLike ? "/images/profile-person.jpg" : "/images/profile-logo.png";

  const log = useCallback(
    (event: string, detail?: Record<string, unknown>) => logEvent({ ...ids, event, detail }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sid, pid, cond?.type],
  );

  const playAgent = useCallback(
    async (msgs: AgentMsg[], idx: number) => {
      if (!cond) return;
      setWaiting(true);
      for (const m of msgs) {
        if (cond.typing === "사용") setTyping(true);
        if (cond.delay === "사용") await sleep(m.delay * 1000);
        setTyping(false);
        setItems((prev) => [...prev, { kind: "agent", text: m.text }]);
        log("agent_message", { step: steps[idx].id, text: m.text.slice(0, 40) });
        if (m.emoticon && cond.emoticon === "사용") {
          setItems((prev) => [...prev, { kind: "emoticon" }]);
        }
      }
      setStepIdx(idx);
      if (idx >= steps.length - 1) {
        const c = makeCode();
        setCode(c);
        log("chat_end", { code: c, duration_ms: Date.now() - startedAt.current });
      } else {
        optionsShownAt.current = Date.now();
        setWaiting(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cond?.type, log],
  );

  useEffect(() => {
    if (!cond || started.current) return;
    started.current = true;
    startedAt.current = Date.now();
    log("session_start", {
      ua: navigator.userAgent,
      screen: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
    });
    playAgent(steps[0].agent, 0);

    const onVis = () => log(document.hidden ? "tab_hidden" : "tab_visible");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cond?.type]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [items, typing, waiting, code]);

  if (!cond) {
    return (
      <div className={s.invalid}>
        <p>잘못된 접근입니다.</p>
        <p>안내받은 링크로 다시 접속해 주세요.</p>
      </div>
    );
  }

  const next = steps[stepIdx + 1];

  function onChoose() {
    if (!next?.user || waiting) return;
    setWaiting(true);
    setItems((prev) => [...prev, { kind: "user", text: next.user! }]);
    log("user_click", { step: next.id, text: next.user, rt_ms: Date.now() - optionsShownAt.current });
    playAgent(next.agent, stepIdx + 1);
  }

  const donateHref = `/donate?${new URLSearchParams({ sid, pid: pid ?? "", type: cond.type }).toString()}`;
  const linkLabel = LINK_LABEL[cond.verbal === "높음" ? "high" : "low"];

  function renderText(text: string) {
    const parts = text.split("{{LINK}}");
    return parts.map((p, i) => (
      <Fragment key={i}>
        {p}
        {i < parts.length - 1 && (
          <a
            className={s.link}
            href={donateHref}
            target="_blank"
            rel="noopener"
            onClick={() => log("donate_link_click")}
          >
            {linkLabel}
          </a>
        )}
      </Fragment>
    ));
  }

  async function copyCode() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      log("code_copy");
    } catch {
      // 복사 실패 시 사용자가 직접 입력
    }
  }

  return (
    <div className={s.shell}>
      <div className={s.chat}>
        <header className={s.header}>
          <img className={s.headerAvatar} src={profile} alt="" />
          <div>
            <strong>{name}</strong>
            <span>기후연대</span>
          </div>
        </header>

        <main className={s.log}>
          {items.map((it, i) => {
            const prev = items[i - 1];
            const grouped = it.kind !== "user" && prev && prev.kind !== "user";
            if (it.kind === "user") {
              return (
                <div key={i} className={s.userRow}>
                  <div className={s.userBubble}>{it.text}</div>
                </div>
              );
            }
            return (
              <div key={i} className={`${s.agentRow} ${grouped ? s.grouped : ""}`}>
                <div className={s.avatarCol}>{!grouped && <img className={s.avatar} src={profile} alt="" />}</div>
                <div className={s.agentCol}>
                  {!grouped && <span className={s.name}>{name}</span>}
                  {it.kind === "emoticon" ? (
                    <img className={s.emoticon} src="/images/emoji-greeting.gif" alt="" />
                  ) : (
                    <div className={s.agentBubble}>{renderText(it.text)}</div>
                  )}
                </div>
              </div>
            );
          })}

          {typing && (
            <div className={`${s.agentRow} ${items.length && items[items.length - 1].kind !== "user" ? s.grouped : ""}`}>
              <div className={s.avatarCol}>
                {!(items.length && items[items.length - 1].kind !== "user") && (
                  <img className={s.avatar} src={profile} alt="" />
                )}
              </div>
              <div className={s.agentCol}>
                {!(items.length && items[items.length - 1].kind !== "user") && <span className={s.name}>{name}</span>}
                <div className={`${s.agentBubble} ${s.typing}`}>
                  작성 중입니다<span className={s.dots}><i>.</i><i>.</i><i>.</i></span>
                </div>
              </div>
            </div>
          )}

          {code && (
            <div className={s.complete}>
              <p className={s.completeTitle}>대화가 종료되었습니다</p>
              <p className={s.completeDesc}>아래 완료 코드를 설문에 입력해 주세요.</p>
              <div className={s.codeBox}>
                <span>{code}</span>
                <button onClick={copyCode}>{copied ? "복사됨" : "복사"}</button>
              </div>
              <p className={s.completeHint}>코드를 입력한 뒤 이 창을 닫아 주세요.</p>
            </div>
          )}
          <div ref={bottomRef} />
        </main>

        {!code && (
          <footer className={s.choices}>
            {next?.user && !waiting ? (
              <button className={s.choice} onClick={onChoose}>
                {next.user}
              </button>
            ) : (
              <div className={s.choicePlaceholder} />
            )}
          </footer>
        )}
      </div>
    </div>
  );
}
