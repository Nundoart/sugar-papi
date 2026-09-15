"use client";

import { FormEvent, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };
const welcome = "Hi! I’m the Sugar Papi Guide. I can help you join, understand memberships, navigate the site, troubleshoot signup, or answer questions about how Sugar Papi works.";
const quickQuestions = ["Help me sign up", "How does matching work?", "What do memberships cost?", "How is my privacy protected?"];

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
    {open && <section className="help-panel" role="dialog" aria-label="Sugar Papi help">
      <div className="help-head"><div><b>Sugar Papi Guide</b><span>AI signup & member concierge</span></div><button onClick={() => setOpen(false)} aria-label="Close help">×</button></div>
      <div className="help-body">
        <div className="help-conversation">{messages.slice(-8).map((message, index) => <p key={index} className={`help-answer ${message.role === "user" ? "help-user" : ""}`}>{message.content}</p>)}{loading && <p className="help-answer">Thinking…</p>}</div>
        <div className="help-quick">{quickQuestions.map((label) => <button key={label} onClick={() => void ask(label)} disabled={loading}>{label}</button>)}</div>
        <a className="help-join" href="/account">Join / Sign in <span>→</span></a>
      </div>
      <form className="help-form" onSubmit={submit}><input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask me anything about Sugar Papi…" aria-label="Ask Sugar Papi a question"/><button type="submit" disabled={loading}>Send</button></form>
    </section>}
    <button className="help-launch" onClick={() => setOpen(!open)} aria-expanded={open}><span>?</span> {open ? "Close" : "Need help?"}</button>
  </div>;
}
