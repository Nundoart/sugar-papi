import { NextRequest, NextResponse } from "next/server";

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
  const {session_id}=await req.json(); if(!session_id)return NextResponse.json({error:'Missing checkout session.'},{status:400});
  const stripe=process.env.STRIPE_SECRET_KEY, url=process.env.SUPABASE_URL, service=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!stripe||!url||!service)return NextResponse.json({error:'Billing sync is not configured.'},{status:503});
  const sr=await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(String(session_id))}`,{headers:{Authorization:`Bearer ${stripe}`},cache:'no-store'});
  const session=await sr.json(); if(!sr.ok)return NextResponse.json({error:session?.error?.message||'Unable to verify checkout.'},{status:502});
  if(session.client_reference_id!==user.id || session.metadata?.user_id!==user.id)return NextResponse.json({error:'Checkout session does not belong to this account.'},{status:403});
  if(session.payment_status!=='paid' && session.status!=='complete')return NextResponse.json({error:'Checkout is not complete.'},{status:409});
  const tier=String(session.metadata?.tier||''); if(!['select','black','icon'].includes(tier))return NextResponse.json({error:'Invalid membership tier.'},{status:400});
  let subscriptionStatus='active', periodEnd:null|string=null;
  const subscriptionId=typeof session.subscription==='string'?session.subscription:null;
  if(subscriptionId){
   const subRes=await fetch(`https://api.stripe.com/v1/subscriptions/${encodeURIComponent(subscriptionId)}`,{headers:{Authorization:`Bearer ${stripe}`},cache:'no-store'});
   if(subRes.ok){const sub=await subRes.json();subscriptionStatus=sub.status||subscriptionStatus;periodEnd=sub.current_period_end?new Date(sub.current_period_end*1000).toISOString():null;}
  }
  const update=await fetch(`${url}/rest/v1/member_profiles?user_id=eq.${encodeURIComponent(user.id)}`,{method:'PATCH',headers:{apikey:service,Authorization:`Bearer ${service}`,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({membership_tier:tier,stripe_customer_id:session.customer||null,stripe_subscription_id:subscriptionId,subscription_status:subscriptionStatus,subscription_current_period_end:periodEnd})});
  if(!update.ok)return NextResponse.json({error:'Payment succeeded, but membership sync needs support.'},{status:502});
  return NextResponse.json({message:'Membership activated.',tier,status:subscriptionStatus});
 }catch(e){console.error('billing sync error',e);return NextResponse.json({error:'Unable to sync membership.'},{status:500});}
}
