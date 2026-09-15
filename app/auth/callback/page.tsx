"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallbackPage(){
 const router=useRouter(), params=useSearchParams();
 const [status,setStatus]=useState("Finishing your secure sign-in…");
 useEffect(()=>{
  async function finish(){
   const hash=new URLSearchParams(window.location.hash.replace(/^#/,''));
   const access_token=hash.get('access_token'), refresh_token=hash.get('refresh_token'), expires_in=hash.get('expires_in');
   if(!access_token||!refresh_token){setStatus("Your email was verified. Return to sign in if you are not automatically signed in."); setTimeout(()=>router.replace('/account?verified=1'),1200); return;}
   const r=await fetch('/api/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({access_token,refresh_token,expires_in})});
   if(!r.ok){setStatus("We verified the link but could not establish a session. Please sign in again.");setTimeout(()=>router.replace('/account'),1500);return;}
   router.replace(params.get('recovery')==='1'?'/reset-password':'/dashboard');
  }
  void finish();
 },[router,params]);
 return <main style={{maxWidth:620,margin:'80px auto',padding:24}}><h1>Sugar Papi</h1><p>{status}</p></main>;
}
