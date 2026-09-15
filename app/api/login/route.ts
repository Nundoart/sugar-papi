import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){
 try{
  const {email,password}=await req.json();
  const url=process.env.SUPABASE_URL, anon=process.env.SUPABASE_ANON_KEY;
  if(!url||!anon) return NextResponse.json({error:"Sign in is temporarily unavailable."},{status:503});
  const r=await fetch(`${url}/auth/v1/token?grant_type=password`,{method:'POST',headers:{apikey:anon,'Content-Type':'application/json'},body:JSON.stringify({email:String(email||'').trim().toLowerCase(),password:String(password||'')})});
  const data=await r.json();
  if(!r.ok) return NextResponse.json({error:data?.error_description||data?.msg||data?.message||"Invalid email or password."},{status:401});
  const res=NextResponse.json({message:"Signed in successfully."});
  const secure=process.env.NODE_ENV==='production';
  res.cookies.set('sp_access',data.access_token,{httpOnly:true,secure,sameSite:'lax',path:'/',maxAge:data.expires_in||3600});
  res.cookies.set('sp_refresh',data.refresh_token,{httpOnly:true,secure,sameSite:'lax',path:'/',maxAge:60*60*24*30});
  return res;
 }catch(e){console.error('login error',e);return NextResponse.json({error:"Sign in is temporarily unavailable."},{status:500});}
}
