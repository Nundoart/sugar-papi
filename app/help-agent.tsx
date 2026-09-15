"use client";

import { FormEvent, useState } from "react";

const quickAnswers = [
  ["How do I sign up?", "Tap Join free or Create your profile. You’ll be taken to the account page to create your account. Add your profile details, choose your city, and complete the onboarding steps. Women join free; men can choose a membership."],
  ["Is it free?", "Women join free. Men choose a monthly membership. The current membership options shown on the site are Select ($100/month), Black ($1,000/month), and Icon ($10,000/month). Memberships renew monthly until canceled."],
  ["How do matches work?", "Sugar Papi is built around mutual interest. You can browse previews and save profiles. A conversation is intended to open only after both members express interest, so there are no cold messages."],
  ["Are the preview profiles real?", "The profiles shown in the public preview illustrate the intended member experience and do not represent actual users. Member photos and full private details are protected."],
  ["How do I sign in?", "Tap Sign in at the top of the site or Account in the footer. That takes you to the Sugar Papi account experience."],
  ["How do memberships work?", "Men can choose Select, Black, or Icon. Higher levels include benefits such as priority discovery, advanced preferences, faster profile review, concierge onboarding, and higher queue priority. Secure checkout is provided through Stripe after account sign-in."],
  ["Can I cancel?", "Yes. The site states that memberships renew monthly until canceled."],
];

function answerQuestion(question: string) {
  const q = question.toLowerCase();
  if (/sign ?up|join|create.*profile|account/.test(q)) return quickAnswers[0][1];
  if (/free|cost|price|how much/.test(q)) return quickAnswers[1][1];
  if (/match|message|connect|chat/.test(q)) return quickAnswers[2][1];
  if (/real|preview|fake|profile/.test(q)) return quickAnswers[3][1];
  if (/sign ?in|log ?in/.test(q)) return quickAnswers[4][1];
  if (/membership|select|black|icon|stripe|pay/.test(q)) return quickAnswers[5][1];
  if (/cancel|renew/.test(q)) return quickAnswers[6][1];
  if (/privacy|private|photo/.test(q)) return "Sugar Papi is designed around privacy and mutual opt-in matching. Public previews keep photos and full personal details private until joining.";
  if (/how.*work|what is|sugar papi/.test(q)) return "Sugar Papi is a curated dating community for ambitious adults. Create a thoughtful profile, discover people privately, save profiles you like, and connect through mutual interest.";
  return "I can help with joining, signing in, profiles, privacy, matching, memberships, pricing, cancellation, and how Sugar Papi works. Try asking one of those questions.";
}

export default function HelpAgent() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("Hi! I’m the Sugar Papi Guide. I can help you join, understand memberships, learn how matching works, or answer common questions.");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!question.trim()) return;
    setAnswer(answerQuestion(question));
    setQuestion("");
  }

  return <div className="help-agent">
    {open && <section className="help-panel" role="dialog" aria-label="Sugar Papi help">
      <div className="help-head"><div><b>Sugar Papi Guide</b><span>Signup & member help</span></div><button onClick={() => setOpen(false)} aria-label="Close help">×</button></div>
      <div className="help-body"><p className="help-answer">{answer}</p><div className="help-quick">{quickAnswers.slice(0,5).map(([label]) => <button key={label} onClick={() => setAnswer(answerQuestion(label))}>{label}</button>)}</div><a className="help-join" href="/account">Join / Sign in <span>→</span></a></div>
      <form className="help-form" onSubmit={submit}><input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask a question…" aria-label="Ask Sugar Papi a question"/><button type="submit">Send</button></form>
    </section>}
    <button className="help-launch" onClick={() => setOpen(!open)} aria-expanded={open}><span>?</span> {open ? "Close" : "Need help?"}</button>
  </div>;
}
