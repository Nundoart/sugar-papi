import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){
 try{
  const {password}=await req.json();
  if(String(password||'').length<8) return NextResponse.json({error:"Password must be at least 8 characters."},{status:400});
  const access=req.cookies.get('sp_access')?.value||'';
  const url=process.env.SUPABASE_URL, anon=process.env.SUPABASE_ANON_KEY;
  if(!url||!anon||!access) return NextResponse.json({error:"Your reset session is missing or expired."},{status:401});
  const r=await fetch(`${url}/auth/v1/user`,{method:'PUT',headers:{apikey:anon,Authorization:`Bearer ${access}`,'Content-Type':'application/json'},body:JSON.stringify({password:String(password)})});
  const data=await r.json().catch(()=>({}));
  if(!r.ok) return NextResponse.json({error:data?.msg||data?.message||"Unable to update password."},{status:r.status});
  return NextResponse.json({message:"Password updated successfully."});
 }catch(e){console.error('password update error',e);return NextResponse.json({error:"Unable to update password."},{status:500});}
}
