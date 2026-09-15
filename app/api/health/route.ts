import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(){
  const checks:{name:string;ok:boolean}[] = [
    {name:"supabase_url",ok:Boolean(process.env.SUPABASE_URL)},
    {name:"supabase_anon",ok:Boolean(process.env.SUPABASE_ANON_KEY)},
    {name:"supabase_service",ok:Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)},
    {name:"stripe",ok:Boolean(process.env.STRIPE_SECRET_KEY)},
  ];

  let database=false;
  const url=process.env.SUPABASE_URL, key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(url&&key){
    try{
      const r=await fetch(`${url}/rest/v1/member_profiles?select=id&limit=1`,{headers:{apikey:key,Authorization:`Bearer ${key}`},cache:"no-store"});
      database=r.ok;
    }catch{ database=false; }
  }
  checks.push({name:"database",ok:database});
  const ok=checks.every(c=>c.ok);
  return NextResponse.json({ok,service:"sugar-papi",checks}, {status: ok?200:503, headers:{"Cache-Control":"no-store"}});
}
