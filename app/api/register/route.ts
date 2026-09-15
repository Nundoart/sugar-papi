import { NextRequest, NextResponse } from "next/server";

function clean(v: unknown, max: number) { return typeof v === "string" ? v.trim().slice(0,max) : ""; }
function adult(date: string) { const d=new Date(date+"T00:00:00Z"); if(Number.isNaN(d.getTime())) return false; const now=new Date(); let age=now.getUTCFullYear()-d.getUTCFullYear(); const m=now.getUTCMonth()-d.getUTCMonth(); if(m<0||(m===0&&now.getUTCDate()<d.getUTCDate())) age--; return age>=18; }
export async function POST(req: NextRequest) {
 try {
  const b=await req.json();
  const first_name=clean(b.first_name,60), email=clean(b.email,200).toLowerCase(), password=clean(b.password,200), gender=clean(b.gender,10), birth_date=clean(b.birth_date,10), city=clean(b.city,100), bio=clean(b.bio,800);
  if(b.consent!=="yes") return NextResponse.json({error:"Please confirm the profile is yours and that you are 18 or older."},{status:400});
  if(!first_name||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||password.length<8||!['man','woman'].includes(gender)||!city||!adult(birth_date)) return NextResponse.json({error:"Please complete all required fields. Passwords must be at least 8 characters and you must be 18 or older."},{status:400});
  const url=process.env.SUPABASE_URL, anon=process.env.SUPABASE_ANON_KEY, service=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!anon||!service) return NextResponse.json({error:"Registration is temporarily unavailable."},{status:503});
  const origin=new URL(req.url).origin;
  const auth=await fetch(`${url}/auth/v1/signup?redirect_to=${encodeURIComponent(origin+"/auth/callback?verified=1")}`,{method:'POST',headers:{apikey:anon,'Content-Type':'application/json'},body:JSON.stringify({email,password,data:{first_name,gender,city}})});
  const authData=await auth.json();
  if(!auth.ok) return NextResponse.json({error:authData?.msg||authData?.message||"Unable to create account."},{status:auth.status});
  const userId=authData?.user?.id || authData?.id;
  if(!userId) return NextResponse.json({error:"Account creation did not return a user ID."},{status:502});
  const profile=await fetch(`${url}/rest/v1/member_profiles`,{method:'POST',headers:{apikey:service,Authorization:`Bearer ${service}`,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({user_id:userId,first_name,email,gender,birth_date,city,bio,is_test:false,membership_tier:gender==='woman'?'free':'free'})});
  if(!profile.ok){console.error('profile create error',profile.status,await profile.text()); return NextResponse.json({error:"Your login was created, but your profile needs support to finish setup."},{status:502});}
  return NextResponse.json({message:authData?.session?"Account created. You can sign in now.":"Account created. Check your email to verify your address, then sign in."},{status:201});
 } catch(e){console.error('register error',e); return NextResponse.json({error:"Registration is temporarily unavailable."},{status:500});}
}
