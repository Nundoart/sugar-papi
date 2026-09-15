import { NextRequest, NextResponse } from "next/server";

const tiers: Record<string,{name:string,amount:number}>={select:{name:'Sugar Papi Select',amount:10000},black:{name:'Sugar Papi Black',amount:100000},icon:{name:'Sugar Papi Icon',amount:1000000}};

async function authUser(req:NextRequest){
 const access=req.cookies.get('sp_access')?.value||'';
 const url=process.env.SUPABASE_URL, anon=process.env.SUPABASE_ANON_KEY;
 if(!url||!anon||!access)return null;
 const r=await fetch(`${url}/auth/v1/user`,{headers:{apikey:anon,Authorization:`Bearer ${access}`},cache:'no-store'});
 if(!r.ok)return null;
 return await r.json();
}

export async function POST(req:NextRequest){
 try{
  const user=await authUser(req); if(!user)return NextResponse.json({error:'Please sign in first.'},{status:401});
  const {tier}=await req.json(); const plan=tiers[String(tier||'')]; if(!plan)return NextResponse.json({error:'Invalid membership tier.'},{status:400});
  const stripe=process.env.STRIPE_SECRET_KEY; if(!stripe)return NextResponse.json({error:'Checkout is not configured yet.'},{status:503});
  const origin=new URL(req.url).origin;
  const body=new URLSearchParams();
  body.set('mode','subscription');
  body.set('success_url',`${origin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`);
  body.set('cancel_url',`${origin}/dashboard?checkout=cancelled`);
  body.set('customer_email',user.email||'');
  body.set('client_reference_id',user.id);
  body.set('metadata[user_id]',user.id);
  body.set('metadata[tier]',String(tier));
  body.set('subscription_data[metadata][user_id]',user.id);
  body.set('subscription_data[metadata][tier]',String(tier));
  body.set('line_items[0][quantity]','1');
  body.set('line_items[0][price_data][currency]','usd');
  body.set('line_items[0][price_data][unit_amount]',String(plan.amount));
  body.set('line_items[0][price_data][recurring][interval]','month');
  body.set('line_items[0][price_data][product_data][name]',plan.name);
  const r=await fetch('https://api.stripe.com/v1/checkout/sessions',{method:'POST',headers:{Authorization:`Bearer ${stripe}`,'Content-Type':'application/x-www-form-urlencoded'},body});
  const data=await r.json(); if(!r.ok)return NextResponse.json({error:data?.error?.message||'Unable to start checkout.'},{status:502});
  return NextResponse.json({url:data.url});
 }catch(e){console.error('checkout error',e);return NextResponse.json({error:'Unable to start checkout.'},{status:500});}
}
