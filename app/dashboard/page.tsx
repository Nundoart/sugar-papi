"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Profile = { first_name: string; email: string; city: string; bio: string; photo_url?: string | null };

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const router = useRouter();
  async function load() { const r = await fetch("/api/me", { cache: "no-store" }); if (r.status === 401) { router.replace("/account"); return; } const d = await r.json(); setProfile(d.profile); setLoading(false); }
  useEffect(() => { void load(); }, []);
  async function save(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setStatus("Saving your profile…"); const r = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget).entries())) }); const d = await r.json(); setStatus(d.message || d.error || "Unable to save your profile."); if (r.ok) void load(); }
  async function logout() { await fetch("/api/logout", { method: "POST" }); router.replace("/account"); }
  if (loading) return <main className="account-shell" style={{ maxWidth: 760, margin: "70px auto", padding: 24 }}><p>Loading your profile…</p></main>;
  if (!profile) return <main className="account-shell" style={{ maxWidth: 760, margin: "70px auto", padding: 24 }}><p>Your account is signed in, but your profile could not be loaded.</p></main>;
  return <main className="account-shell" style={{ maxWidth: 760, margin: "50px auto", padding: 24 }}>
    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" }}><div><p style={{ opacity: .7, margin: 0 }}>One at a Time</p><h1 style={{ marginTop: 6 }}>Welcome, {profile.first_name}</h1></div><button onClick={logout}>Sign out</button></div>
    <p>{profile.email}</p>
    <section style={{ margin: "28px 0", padding: 20, border: "1px solid #333", borderRadius: 16 }}><h2>Your focused-dating profile</h2><p>Keep this current so each conversation starts with an honest picture of you.</p>{status && <p role="status">{status}</p>}<form onSubmit={save} style={{ display: "grid", gap: 14 }}><input aria-label="First name" name="first_name" required maxLength={60} defaultValue={profile.first_name} /><input aria-label="City" name="city" required maxLength={100} defaultValue={profile.city} /><textarea aria-label="About you" name="bio" rows={5} maxLength={800} defaultValue={profile.bio || ""} placeholder="A little about you" /><input aria-label="Photo URL" name="photo_url" type="url" placeholder="Photo URL" defaultValue={profile.photo_url || ""} /><button type="submit">Save profile</button></form></section>
    <section style={{ padding: 20, border: "1px solid #333", borderRadius: 16 }}><h2>The One at a Time rule</h2><p>You can focus on one mutual match at a time. When it is not the right fit, end the match respectfully and share a brief reason before returning to discovery.</p><button onClick={() => router.push("/dating")}>Discover people</button></section>
  </main>;
}
