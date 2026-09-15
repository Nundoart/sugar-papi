"use client";

import { FormEvent, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };
const welcome = "Welcome. I’m the Sugar Papi Concierge. I can help with membership, signup, privacy, matching, and anything else you need to get started.";
const quickQuestions = ["Help me join", "How does matching work?", "Membership options", "Privacy & discretion"];

export default function HelpAgent() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: welcome }]);
  const [loading, setLoading] = useState(false);

  async function ask(text: string) {
    const clean = text.trim();
    if (!clean || loading) return;
    const next: Message[] = [...messages, { role: "user", content: clean }];
    setMessages(next);
    setQuestion("");
    setLoading(true);
    try {
      const response = await fetch("/api/help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-12) }),
      });
      const data = await response.json();
      setMessages((current) => [...current, { role: "assistant", content: data.answer || data.error || "I couldn't answer that right now." }]);
    } catch {
      setMessages((current) => [...current, { role: "assistant", content: "I’m having trouble connecting right now. You can still use Join / Sign in below." }]);
    } finally {
      setLoading(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void ask(question);
  }

  return <div className="help-agent">
    {open && <section className="help-panel" role="dialog" aria-label="Sugar Papi concierge">
      <div className="help-head">
        <div className="help-brandmark" aria-hidden="true">◆</div>
        <div className="help-head-copy"><b>Private Concierge</b><span>Discreet help, whenever you need it</span></div>
        <button onClick={() => setOpen(false)} aria-label="Close concierge">×</button>
      </div>
      <div className="help-body">
        <div className="help-conversation">{messages.slice(-8).map((message, index) => <p key={index} className={`help-answer ${message.role === "user" ? "help-user" : ""}`}>{message.content}</p>)}{loading && <p className="help-answer help-thinking">Thinking…</p>}</div>
        <div className="help-quick">{quickQuestions.map((label) => <button key={label} onClick={() => void ask(label)} disabled={loading}>{label}</button>)}</div>
        <a className="help-join" href="/account"><span>Join or sign in</span><span>→</span></a>
      </div>
      <form className="help-form" onSubmit={submit}><input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask the Concierge…" aria-label="Ask the Concierge a question"/><button type="submit" disabled={loading} aria-label="Send message">→</button></form>
    </section>}
    <button className="help-launch" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? "Close Concierge" : "Open Private Concierge"}>
      <span className="help-launch-icon" aria-hidden="true">◆</span>
      <span className="help-launch-copy"><b>{open ? "Close" : "Concierge"}</b>{!open && <small>Private assistance</small>}</span>
    </button>
  </div>;
}
