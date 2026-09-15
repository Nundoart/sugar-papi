"use client";

import { FormEvent, useState } from "react";

export default function AccountPage() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true); setStatus("");
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const r = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await r.json();
      setStatus(data.message || data.error || "Unable to register.");
      if (r.ok) e.currentTarget.reset();
    } catch { setStatus("Registration is temporarily unavailable. Please try again."); }
    finally { setLoading(false); }
  }
  return <main style={{maxWidth:640,margin:"60px auto",padding:"24px"}}>
    <h1>Create your Sugar Papi profile</h1>
    <p>Join the private, consent-first community. You must be 18 or older.</p>
    <form onSubmit={submit} style={{display:"grid",gap:14}}>
      <input name="first_name" required maxLength={60} placeholder="First name" />
      <input name="email" type="email" required maxLength={200} placeholder="Email" />
      <select name="gender" required defaultValue=""><option value="" disabled>I am a…</option><option value="woman">Woman</option><option value="man">Man</option></select>
      <label>Birth date<input name="birth_date" type="date" required style={{display:"block",width:"100%"}} /></label>
      <input name="city" required maxLength={100} placeholder="City" />
      <textarea name="bio" maxLength={800} placeholder="A little about you" rows={5} />
      <input name="photo_url" type="url" maxLength={1000} placeholder="Photo URL (optional for now)" />
      <label style={{display:"flex",gap:8}}><input name="consent" type="checkbox" value="yes" required /> I confirm this is my own profile and I am 18 or older.</label>
      <button type="submit" disabled={loading}>{loading ? "Creating…" : "Create profile"}</button>
    </form>
    {status && <p role="status" style={{marginTop:16}}>{status}</p>}
  </main>;
}
