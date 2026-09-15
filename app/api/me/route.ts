import { NextRequest, NextResponse } from "next/server";

async function getUser(req: NextRequest){
 const url=process.env.SUPABASE_URL, anon=process.env.SUPABASE_ANON_KEY;
 if(!url||!anon) return null;
 let access=req.cookies.get('sp_access')?.value||'';
 const refresh=req.cookies.get('sp_refresh')?.value||'';
 let userRes=access?await fetch(`${url}/auth/v1/user`,{headers:{apikey:anon,Authorization:`Bearer ${access}`},cache:'no-store'}):null;
 let refreshed:any=null;
 if((!userRes||!userRes.ok)&&refresh){
  const rr=await fetch(`${url}/auth/v1/token?grant_type=refresh_token`,{method:'POST',headers:{apikey:anon,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:refresh})});
  if(rr.ok){refreshed=await rr.json(); access=refreshed.access_token; userRes=await fetch(`${url}/auth/v1/user`,{headers:{apikey:anon,Authorization:`Bearer ${access}`},cache:'no-store'});}
 }
 if(!userRes?.ok) return null;
 return {user:await userRes.json(),access,refreshed};
}

export async function GET(req: NextRequest){
 const auth=await getUser(req);
 if(!auth) return NextResponse.json({error:"Not signed in."},{status:401});
 const url=process.env.SUPABASE_URL!, anon=process.env.SUPABASE_ANON_KEY!;
 const profileRes=await fetch(`${url}/rest/v1/member_profiles?user_id=eq.${encodeURIComponent(auth.user.id)}&select=id,first_name,email,gender,birth_date,city,bio,photo_url,membership_tier,subscription_status,profile_complete`,{headers:{apikey:anon,Authorization:`Bearer ${auth.access}`},cache:'no-store'});
 const rows=profileRes.ok?await profileRes.json():[];
 const res=NextResponse.json({user:{id:auth.user.id,email:auth.user.email,email_confirmed_at:auth.user.email_confirmed_at},profile:rows?.[0]||null});
 if(auth.refreshed){const secure=process.env.NODE_ENV==='production';res.cookies.set('sp_access',auth.refreshed.access_token,{httpOnly:true,secure,sameSite:'lax',path:'/',maxAge:auth.refreshed.expires_in||3600});res.cookies.set('sp_refresh',auth.refreshed.refresh_token,{httpOnly:true,secure,sameSite:'lax',path:'/',maxAge:60*60*24*30});}
 return res;
}
