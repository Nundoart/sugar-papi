import { NextRequest, NextResponse } from "next/server";

type StripeEvent={id:string;type:string;livemode:boolean;data?:{object?:Record<string,any>}};

async function db(path:string,init:RequestInit={}){
 const url=process.env.SUPABASE_URL, key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key) throw new Error('Supabase service configuration is missing');
 return fetch(`${url}/rest/v1/${path}`,{...init,headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json',...(init.headers||{})},cache:'no-store'});
}

async function verifyEvent(eventId:string):Promise<StripeEvent|null>{
 const key=process.env.STRIPE_SECRET_KEY;
 if(!key||!/^evt_[A-Za-z0-9]+$/.test(eventId))return null;
 const r=await fetch(`https://api.stripe.com/v1/events/${encodeURIComponent(eventId)}`,{headers:{Authorization:`Bearer ${key}`},cache:'no-store'});
 if(!r.ok)return null;
 return await r.json();
}

async function alreadyProcessed(id:string){
 const r=await db(`stripe_webhook_events?event_id=eq.${encodeURIComponent(id)}&select=event_id&limit=1`);
 return r.ok && (await r.json()).length>0;
}

async function markProcessed(event:StripeEvent){
 const r=await db('stripe_webhook_events',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({event_id:event.id,event_type:event.type})});
 if(!r.ok && r.status!==409)throw new Error('Could not mark Stripe event processed');
}

async function updateByUser(userId:string,patch:Record<string,unknown>){
 const r=await db(`member_profiles?user_id=eq.${encodeURIComponent(userId)}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify(patch)});
 if(!r.ok)throw new Error(`Profile update failed: ${r.status}`);
}
async function updateBySubscription(subscriptionId:string,patch:Record<string,unknown>){
 const r=await db(`member_profiles?stripe_subscription_id=eq.${encodeURIComponent(subscriptionId)}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify(patch)});
 if(!r.ok)throw new Error(`Subscription profile update failed: ${r.status}`);
}
async function updateByCustomer(customerId:string,patch:Record<string,unknown>){
 const r=await db(`member_profiles?stripe_customer_id=eq.${encodeURIComponent(customerId)}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify(patch)});
 if(!r.ok)throw new Error(`Customer profile update failed: ${r.status}`);
}

function periodEnd(obj:Record<string,any>){return obj.current_period_end?new Date(Number(obj.current_period_end)*1000).toISOString():null;}

export async function POST(req:NextRequest){
 try{
  const incoming=await req.json().catch(()=>null) as {id?:unknown}|null;
  const eventId=typeof incoming?.id==='string'?incoming.id:'';
  if(!eventId)return NextResponse.json({error:'Missing event id.'},{status:400});

  // Security: never trust the posted payload. Re-fetch the event directly from Stripe
  // with the server-side live secret key and process only that verified Stripe object.
  const event=await verifyEvent(eventId);
  if(!event)return NextResponse.json({error:'Unable to verify Stripe event.'},{status:400});
  if(await alreadyProcessed(event.id))return NextResponse.json({received:true,duplicate:true});

  const obj=event.data?.object||{};
  if(event.type==='checkout.session.completed'){
   const userId=String(obj.metadata?.user_id||obj.client_reference_id||'');
   const tier=String(obj.metadata?.tier||'');
   if(userId && ['select','black','icon'].includes(tier)){
    await updateByUser(userId,{membership_tier:tier,stripe_customer_id:obj.customer||null,stripe_subscription_id:obj.subscription||null,subscription_status:'active'});
   }
  } else if(['customer.subscription.created','customer.subscription.updated','customer.subscription.resumed','customer.subscription.paused'].includes(event.type)){
   const subscriptionId=String(obj.id||'');
   const userId=String(obj.metadata?.user_id||'');
   const tier=String(obj.metadata?.tier||'');
   const patch:Record<string,unknown>={stripe_subscription_id:subscriptionId,subscription_status:obj.status||'active',subscription_current_period_end:periodEnd(obj)};
   if(obj.customer)patch.stripe_customer_id=obj.customer;
   if(['select','black','icon'].includes(tier))patch.membership_tier=tier;
   if(userId)await updateByUser(userId,patch); else if(subscriptionId)await updateBySubscription(subscriptionId,patch);
  } else if(event.type==='customer.subscription.deleted'){
   const subscriptionId=String(obj.id||'');
   const userId=String(obj.metadata?.user_id||'');
   const patch={subscription_status:'canceled',membership_tier:null,subscription_current_period_end:periodEnd(obj)};
   if(userId)await updateByUser(userId,patch); else if(subscriptionId)await updateBySubscription(subscriptionId,patch);
  } else if(event.type==='invoice.payment_failed'){
   const customer=String(obj.customer||'');
   if(customer)await updateByCustomer(customer,{subscription_status:'past_due'});
  } else if(event.type==='invoice.paid' || event.type==='invoice.payment_succeeded'){
   const customer=String(obj.customer||'');
   if(customer)await updateByCustomer(customer,{subscription_status:'active'});
  }

  await markProcessed(event);
  return NextResponse.json({received:true});
 }catch(e){
  console.error('stripe webhook error',e);
  return NextResponse.json({error:'Webhook processing failed.'},{status:500});
 }
}
