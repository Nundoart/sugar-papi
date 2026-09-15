import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest){
 try{
  const access=req.cookies.get('sp_access')?.value||'';
  const url=process.env.SUPABASE_URL, anon=process.env.SUPABASE_ANON_KEY;
  if(!url||!anon||!access) return NextResponse.json({error:"Not signed in."},{status:401});
  const userRes=await fetch(`${url}/auth/v1/user`,{headers:{apikey:anon,Authorization:`Bearer ${access}`},cache:'no-store'});
  if(!userRes.ok) return NextResponse.json({error:"Your session expired. Please sign in again."},{status:401});
  const user=await userRes.json();
  const b=await req.json();
  const first_name=String(b.first_name||'').trim().slice(0,60),city=String(b.city||'').trim().slice(0,100),bio=String(b.bio||'').trim().slice(0,800),photo_url=String(b.photo_url||'').trim().slice(0,1000);
  if(!first_name||!city) return NextResponse.json({error:"Name and city are required."},{status:400});
  if(photo_url&&!/^https:\/\//i.test(photo_url)) return NextResponse.json({error:"Photo URL must use HTTPS."},{status:400});
  const r=await fetch(`${url}/rest/v1/member_profiles?user_id=eq.${encodeURIComponent(user.id)}`,{method:'PATCH',headers:{apikey:anon,Authorization:`Bearer ${access}`,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({first_name,city,bio,photo_url:photo_url||null,profile_complete:Boolean(first_name&&city&&bio)})});
  if(!r.ok) return NextResponse.json({error:"Unable to update your profile."},{status:r.status});
  return NextResponse.json({message:"Profile updated."});
 }catch(e){console.error('profile update error',e);return NextResponse.json({error:"Unable to update your profile."},{status:500});}
}
