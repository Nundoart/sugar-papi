"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage(){
 const [status,setStatus]=useState(''),[loading,setLoading]=useState(false); const router=useRouter();
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setLoading(true);setStatus('');const fd=new FormData(e.currentTarget);const password=String(fd.get('password')||''),confirm=String(fd.get('confirm')||'');if(password!==confirm){setStatus('Passwords do not match.');setLoading(false);return;}const r=await fetch('/api/password/update',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})});const d=await r.json();setStatus(d.message||d.error||'Unable to update password.');setLoading(false);if(r.ok)setTimeout(()=>router.replace('/dashboard'),800);}
 return <main style={{maxWidth:520,margin:'70px auto',padding:24}}><h1>Set a new password</h1><form onSubmit={submit} style={{display:'grid',gap:14}}><input name="password" type="password" minLength={8} required placeholder="New password"/><input name="confirm" type="password" minLength={8} required placeholder="Confirm new password"/><button disabled={loading}>{loading?'Updating…':'Update password'}</button></form>{status&&<p role="status">{status}</p>}</main>;
}
