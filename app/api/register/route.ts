import { NextRequest, NextResponse } from "next/server";

function clean(v: unknown, max: number) { return typeof v === "string" ? v.trim().slice(0,max) : ""; }
function adult(date: string) { const d=new Date(date+"T00:00:00Z"); if(Number.isNaN(d.getTime())) return false; const now=new Date(); let age=now.getUTCFullYear()-d.getUTCFullYear(); const m=now.getUTCMonth()-d.getUTCMonth(); if(m<0||(m===0&&now.getUTCDate()<d.getUTCDate())) age--; return age>=18; }
export async function POST(req: NextRequest) {
 try {
  const b=await req.json();
  const first_name=clean(b.first_name,60), email=clean(b.email,200).toLowerCase(), gender=clean(b.gender,10), birth_date=clean(b.birth_date,10), city=clean(b.city,100), bio=clean(b.bio,800), photo_url=clean(b.photo_url,1000);
  if(b.consent!=="yes") return NextResponse.json({error:"Please confirm the profile is yours and that you are 18 or older."},{status:400});
  if(!first_name||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!['man','woman'].includes(gender)||!city||!adult(birth_date)) return NextResponse.json({error:"Please complete all required fields with valid information. You must be 18 or older."},{status:400});
  if(photo_url && !/^https:\/\//i.test(photo_url)) return NextResponse.json({error:"Photo URL must use HTTPS."},{status:400});
  const url=process.env.SUPABASE_URL, key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key) return NextResponse.json({error:"Registration is temporarily unavailable."},{status:503});
  const r=await fetch(`${url}/rest/v1/member_profiles`,{method:'POST',headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({first_name,email,gender,birth_date,city,bio,photo_url:photo_url||null,is_test:false})});
  if(r.status===409) return NextResponse.json({error:"An account with that email already exists."},{status:409});
  if(!r.ok){console.error('registration db error',r.status,await r.text()); return NextResponse.json({error:"We couldn't create your profile right now."},{status:502});}
  return NextResponse.json({message:"Profile created successfully. Welcome to Sugar Papi."},{status:201});
 } catch(e){console.error('register error',e); return NextResponse.json({error:"Registration is temporarily unavailable."},{status:500});}
}
