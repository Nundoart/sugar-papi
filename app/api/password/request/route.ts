import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){
 try{
  const {email}=await req.json();
  const url=process.env.SUPABASE_URL, anon=process.env.SUPABASE_ANON_KEY;
  if(!url||!anon) return NextResponse.json({error:"Password reset is temporarily unavailable."},{status:503});
  const origin=new URL(req.url).origin;
  await fetch(`${url}/auth/v1/recover?redirect_to=${encodeURIComponent(origin+"/auth/callback?recovery=1")}`,{method:'POST',headers:{apikey:anon,'Content-Type':'application/json'},body:JSON.stringify({email:String(email||'').trim().toLowerCase()})});
  return NextResponse.json({message:"If that email exists, a password reset link has been sent."});
 }catch(e){console.error('password reset request error',e);return NextResponse.json({error:"Password reset is temporarily unavailable."},{status:500});}
}
