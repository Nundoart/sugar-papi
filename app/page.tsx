"use client";

import { useState } from "react";

const freeAccessEnd = new Date("2026-09-19T16:20:00.000Z");

const profiles = [
  ["Aria", "29", "Charlotte", "Creative director", "fuchsia"],
  ["Maya", "31", "Miami", "Founder", "cyan"],
  ["Sofia", "27", "Nashville", "Music producer", "violet"],
  ["Camille", "33", "New York", "Art consultant", "amber"],
  ["Nia", "30", "Atlanta", "Brand strategist", "emerald"],
  ["Elena", "28", "Austin", "Architect", "rose"],
];
const menProfiles = [
  ["Grant", "45", "Charlotte", "Real estate developer", "amber", "Lake weekends, last-minute flights, and making sure the woman beside me feels appreciated."],
  ["Marcus", "41", "Atlanta", "Technology founder", "cyan", "I value ambition, discretion, first-class travel, and thoughtful gestures that never feel ordinary."],
  ["Julian", "48", "Miami", "Private investor", "violet", "From yachts to hidden restaurants, I enjoy creating unforgettable experiences with the right woman."],
  ["Theo", "39", "Nashville", "Entertainment executive", "rose", "Confident, generous, and always planning the next concert weekend or luxury escape."],
  ["Andre", "44", "New York", "Finance executive", "emerald", "Great style, meaningful conversation, beautiful hotels, and surprises chosen with intention."],
  ["William", "52", "Charleston", "Hospitality owner", "fuchsia", "Old-school manners, coastal getaways, and a soft spot for spoiling someone who truly appreciates it."],
];
const tiers = [
  {name:"Select",price:100},
  {name:"Black",price:1000},
  {name:"Icon",price:10000},
];

export default function Home() {
  const [selected, setSelected] = useState<(typeof profiles)[number] | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [tier, setTier] = useState("Black");
  const [signup, setSignup] = useState(false);
  const [signupRole, setSignupRole] = useState<"women"|"men"|"">("");
  const goTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  return <main className="min-h-screen bg-zinc-950 text-white">
    <header className="flex h-20 items-center justify-between border-b border-white/10 px-6 sm:px-10">
      <b className="text-2xl">Sugar <i className="font-serif text-rose-300">Papi</i></b>
      <nav aria-label="Primary navigation" className="hidden gap-8 text-sm text-zinc-300 md:flex">
        <button onClick={()=>goTo("discover")} className="transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300">Discover</button>
        <button onClick={()=>goTo("matches")} className="transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300">Matches</button>
        <button onClick={()=>goTo("messages")} className="transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300">Messages</button>
      </nav>
      <a href="/account" className="rounded-full border border-white/20 px-4 py-2 text-sm">Join / Account</a>
    </header>
    <section className="mx-auto max-w-7xl px-6 py-12 sm:px-10">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-rose-300">Curated connections</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Meet people who match your pace.</h1>
      <p className="mt-3 text-lg italic text-rose-200">More than a gym membership, less than a divorce.</p>
      <div className="mt-5 rounded-2xl border border-emerald-300/40 bg-emerald-400/10 p-5"><b className="text-lg text-emerald-200">Free access for everyone for 7 days.</b><p className="mt-1 text-sm text-zinc-300">Create your profile and browse without payment through {freeAccessEnd.toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}. Men’s paid membership requirement resumes automatically after the promotion.</p><a href="/account" className="mt-4 inline-flex rounded-full bg-emerald-200 px-5 py-3 text-sm font-semibold text-black">Join free now</a></div>
      <section className="mt-8 grid gap-4 md:grid-cols-3">{tiers.map(plan=><article key={plan.name} onClick={()=>setTier(plan.name)} className={"cursor-pointer rounded-3xl border border-rose-300/40 bg-zinc-900 p-6 text-left "+(tier===plan.name?"ring-2 ring-white":"")}><small className="font-bold uppercase tracking-widest text-rose-200">{plan.name}</small><div className="mt-2 text-3xl font-semibold">{"$"}{plan.price.toLocaleString()}<span className="text-sm font-normal text-zinc-400"> / month</span></div><p className="mt-3 text-sm text-zinc-300">{plan.name==="Icon"?"First access to new profiles":plan.name==="Black"?"Priority discovery access":"Join the discovery queue"}</p><a href={`/account?tier=${plan.name.toLowerCase()}`} className="mt-5 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-black" onClick={e=>e.stopPropagation()}>Choose {plan.name}</a></article>)}</section>
      <div className="mt-5 rounded-2xl border border-white/10 bg-zinc-900/70 p-5 text-sm text-zinc-300"><b className="text-white">{tier} queue rule:</b> women are offered to Icon members first, then Black, then Select. A member&apos;s pass releases that profile to the next queue. A match only starts when both people opt in.</div>
      <div className="my-8 flex gap-2 overflow-auto"><b className="rounded-full bg-white px-4 py-2 text-sm text-black">For meaningful dating</b>{["Ambition","Travel","Culture","Wellness"].map(x=><button className="rounded-full border border-white/15 px-4 py-2 text-sm" key={x}>{x}</button>)}</div>
      <div id="discover" className="scroll-mt-24 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{profiles.map((p,i)=><article key={p[0]} className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900">
        <button className={"relative block h-64 w-full bg-gradient-to-br from-"+p[4]+"-600 to-rose-400 text-left"} onClick={()=>setSelected(p)}>
          
          <span className="absolute inset-0 grid place-items-center bg-black/55 text-lg font-semibold">Join to view photos</span>
          <em className="absolute right-4 top-4 rounded-full bg-black/40 px-3 py-1 text-xs not-italic">Active now</em>
        </button>
        <div className="p-5"><div className="flex justify-between"><button className="text-left" onClick={()=>setSelected(p)}><h2 className="text-xl font-semibold">{p[0]}, {p[1]}</h2><p className="mt-1 text-sm text-zinc-400">{p[3]} · {p[2]}</p></button><button aria-label={"Save "+p[0]} onClick={()=>setSaved(old=>old.includes(p[0])?old.filter(n=>n!==p[0]):[...old,p[0]])}>{saved.includes(p[0])?"♥":"♡"}</button></div><p className="mt-4 text-sm text-zinc-300">{["Passport ready for five-star escapes, surprise gifts, and a generous man who loves to spoil.","Building a beautiful life—and looking for a successful gentleman who makes luxury, travel, and thoughtful gifts part of the adventure.","Champagne weekends, designer surprises, and first-class chemistry with a confident, generous man.","Gallery openings, private getaways, and being spoiled by someone who understands that generosity is irresistible.","Ambitious, polished, and ready for unforgettable trips, elevated experiences, and a man who enjoys giving.","Drawn to powerful men, beautiful destinations, meaningful gifts, and the kind of attention that makes a woman feel truly spoiled."][i]}</p></div>
      </article>)}</div>
      <section className="mt-14">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><small className="font-bold uppercase tracking-widest text-cyan-200">Preview for women</small><h2 className="mt-2 text-3xl font-semibold">Meet the kind of men joining Sugar Papi.</h2></div><span className="rounded-full border border-white/15 px-3 py-1 text-xs text-zinc-400">Sample profiles</span></div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{menProfiles.map((p)=><article key={p[0]} className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900">
          <button className={"relative block h-64 w-full bg-gradient-to-br from-"+p[4]+"-700 to-zinc-950 text-left"} onClick={()=>setSelected(p)}><span className="absolute inset-0 grid place-items-center bg-black/45 text-lg font-semibold">Join to view photos</span><em className="absolute right-4 top-4 rounded-full bg-black/50 px-3 py-1 text-xs not-italic">Preview profile</em></button>
          <div className="p-5"><div className="flex justify-between gap-4"><button className="text-left" onClick={()=>setSelected(p)}><h3 className="text-xl font-semibold">{p[0]}, {p[1]}</h3><p className="mt-1 text-sm text-zinc-400">{p[3]} · {p[2]}</p></button><button aria-label={"Save "+p[0]} onClick={()=>setSaved(old=>old.includes(p[0])?old.filter(n=>n!==p[0]):[...old,p[0]])}>{saved.includes(p[0])?"♥":"♡"}</button></div><p className="mt-4 text-sm text-zinc-300">{p[5]}</p></div>
        </article>)}</div>
        <p className="mt-4 text-xs text-zinc-500">These sample profiles demonstrate the intended member experience and do not represent actual users.</p>
      </section>
      <section id="matches" className="scroll-mt-24 mt-12 rounded-3xl border border-white/10 bg-zinc-900 p-6 sm:p-8">
        <div className="flex items-end justify-between gap-4"><div><small className="font-bold uppercase tracking-widest text-rose-200">Your matches</small><h2 className="mt-2 text-2xl font-semibold">People you saved</h2></div><span className="rounded-full bg-white/10 px-3 py-1 text-sm">{saved.length}</span></div>
        {saved.length ? <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{saved.map(name=>{const p=[...profiles,...menProfiles].find(profile=>profile[0]===name)!; return <button key={name} onClick={()=>setSelected(p)} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-left transition hover:border-rose-300/50"><b>{p[0]}, {p[1]}</b><p className="mt-1 text-sm text-zinc-400">{p[3]} · {p[2]}</p></button>})}</div> : <p className="mt-5 text-zinc-400">Tap the heart on a profile and it will appear here.</p>}
      </section>
      <section id="messages" className="scroll-mt-24 mt-5 rounded-3xl border border-white/10 bg-zinc-900 p-6 sm:p-8">
        <small className="font-bold uppercase tracking-widest text-rose-200">Messages</small><h2 className="mt-2 text-2xl font-semibold">Your conversations</h2>
        <div className="mt-6 rounded-2xl border border-dashed border-white/15 p-6 text-center"><p className="font-medium">No conversations yet</p><p className="mt-2 text-sm text-zinc-400">When you and another member both opt in, your conversation will appear here.</p><button onClick={()=>goTo("discover")} className="mt-5 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black">Browse profiles</button></div>
      </section>
      <aside className="mt-5 rounded-3xl border border-white/15 bg-white/5 p-8"><small className="font-bold uppercase tracking-widest text-emerald-200">Account-protected checkout</small><h2 className="mt-3 text-2xl font-semibold">Men’s memberships are powered by Stripe.</h2><p className="mt-3 text-zinc-300">Sign in before checkout so your subscription is securely connected to your account. Subscriptions renew monthly until canceled; Sugar Papi never stores card numbers.</p></aside>
    </section>
    {selected && <div className="fixed inset-0 grid place-items-center bg-black/70 p-5" onClick={()=>setSelected(null)}><section className="w-full max-w-md rounded-3xl bg-zinc-900 p-7" onClick={e=>e.stopPropagation()}><button className="float-right" onClick={()=>setSelected(null)}>Close</button><small className="text-rose-300">VERIFIED PROFILE</small><h2 className="mt-3 text-3xl font-semibold">{selected[0]}, {selected[1]}</h2><p className="mt-1 text-zinc-400">{selected[3]} · {selected[2]}</p><p className="my-6 text-zinc-200">Thoughtful, ambitious, and interested in building a real connection.</p><button className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black">Say hello</button></section></div>}
    {signup && <div className="fixed inset-0 z-20 grid place-items-center bg-black/70 p-5" onClick={()=>setSignup(false)}><section className="w-full max-w-lg rounded-3xl bg-zinc-900 p-7" onClick={e=>e.stopPropagation()}><button className="float-right" onClick={()=>setSignup(false)}>Close</button>{!signupRole?<><small className="font-bold uppercase tracking-widest text-rose-200">Create your account</small><h2 className="mt-3 text-3xl font-semibold">Choose your onboarding path.</h2><div className="mt-6 grid gap-3 sm:grid-cols-2"><button onClick={()=>setSignupRole("women")} className="rounded-2xl border border-emerald-300/40 bg-emerald-400/10 p-5 text-left"><b>Women · Free</b><p className="mt-2 text-sm text-zinc-300">Profile and photo verification</p></button><button onClick={()=>setSignupRole("men")} className="rounded-2xl border border-rose-300/40 bg-rose-400/10 p-5 text-left"><b>Men · Paid membership</b><p className="mt-2 text-sm text-zinc-300">Choose Select, Black, or Icon</p></button></div></>:<><small className="font-bold uppercase tracking-widest text-rose-200">Secure account required</small><h2 className="mt-3 text-3xl font-semibold">Continue through your account.</h2><p className="mt-5 text-sm text-zinc-300">Sign in, complete your profile, and choose your membership. Payments are connected to your account automatically.</p><a href="/account" className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-black">Continue to account</a></>}</section></div>}
  </main>;
}
