import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){
 try{
  const {access_token,refresh_token,expires_in}=await req.json();
  if(!access_token||!refresh_token) return NextResponse.json({error:"Missing session tokens."},{status:400});
  const url=process.env.SUPABASE_URL, anon=process.env.SUPABASE_ANON_KEY;
  if(!url||!anon) return NextResponse.json({error:"Session setup is unavailable."},{status:503});
  const check=await fetch(`${url}/auth/v1/user`,{headers:{apikey:anon,Authorization:`Bearer ${access_token}`},cache:'no-store'});
  if(!check.ok) return NextResponse.json({error:"Invalid session."},{status:401});
  const res=NextResponse.json({message:"Session established."});
  const secure=process.env.NODE_ENV==='production';
  res.cookies.set('sp_access',access_token,{httpOnly:true,secure,sameSite:'lax',path:'/',maxAge:Number(expires_in)||3600});
  res.cookies.set('sp_refresh',refresh_token,{httpOnly:true,secure,sameSite:'lax',path:'/',maxAge:60*60*24*30});
  return res;
 }catch(e){console.error('session error',e);return NextResponse.json({error:"Session setup failed."},{status:500});}
}
