import { NextRequest, NextResponse } from 'next/server';
import { database, datingAuth, sameOrigin } from '../../../lib/dating-auth';

const fields = 'user_id,first_name,gender,birth_date,city,bio,photo_url';
type Member = { user_id: string; first_name: string; gender: string; birth_date: string; city: string; bio: string; photo_url: string | null };
function visibleMember(p: Member) {
 const birth = new Date(p.birth_date+'T00:00:00Z'), now = new Date();
 let age=now.getUTCFullYear()-birth.getUTCFullYear();
 if(now.getUTCMonth()<birth.getUTCMonth() || (now.getUTCMonth()===birth.getUTCMonth() && now.getUTCDate()<birth.getUTCDate())) age--;
 return {id:p.user_id,name:p.first_name,age,gender:p.gender,city:p.city,bio:p.bio,photo:p.photo_url};
}
async function rows(response: Response) { if(!response.ok) throw new Error('Database unavailable'); return response.json(); }
export async function GET(req: NextRequest) {
 try {
  const auth=await datingAuth(req);
  if(!auth) return NextResponse.json({error:'Sign in with a verified email to discover members.'},{status:401});
  const [myRows,activeRows,endedRows] = await Promise.all([
   database(auth,`member_profiles?user_id=eq.${auth.id}&select=${fields},profile_complete&limit=1`).then(rows),
   database(auth,`oat_active_members?user_id=eq.${auth.id}&select=match_id&limit=1`).then(rows),
   database(auth,`oat_matches?or=(user_a.eq.${auth.id},user_b.eq.${auth.id})&ended_at=not.is.null&select=id,ended_at,ended_by,end_reason&order=ended_at.desc&limit=1`).then(rows)
  ]);
  const mine=myRows[0];
  const complete=Boolean(mine?.profile_complete && mine?.bio && visibleMember(mine).age>=18);
  if(activeRows.length) {
   const matches=await database(auth,`oat_matches?id=eq.${activeRows[0].match_id}&select=id,user_a,user_b,created_at,ended_at&limit=1`).then(rows);
   const match=matches[0];
   if(match && !match.ended_at) {
    const other=match.user_a===auth.id?match.user_b:match.user_a;
    const [partners,messages]=await Promise.all([
     database(auth,`member_profiles?user_id=eq.${other}&select=${fields}&limit=1`).then(rows),
     database(auth,`oat_messages?match_id=eq.${match.id}&select=id,sender_id,content,created_at&order=created_at.desc&limit=100`).then(rows)
    ]);
    return NextResponse.json({me:auth.id,complete,match:{id:match.id,partner:partners[0]?visibleMember(partners[0]):null},messages:messages.reverse(),profiles:[],likes:[],incoming:[],lastEnd:endedRows[0]??null});
   }
  }
  // Discovery never returns a profile list while this account has an active match.
  if(!complete) return NextResponse.json({me:auth.id,complete:false,match:null,profiles:[],messages:[],likes:[],incoming:[],lastEnd:endedRows[0]??null});
  const [candidates,busy,likes,incoming] = await Promise.all([
   database(auth,`member_profiles?user_id=neq.${auth.id}&is_test=eq.false&profile_complete=eq.true&status=eq.active&user_id=not.is.null&select=${fields}&order=created_at.desc&limit=200`).then(rows),
   database(auth,'oat_active_members?select=user_id').then(rows),
   database(auth,`oat_likes?user_id=eq.${auth.id}&select=target_id`).then(rows),
   database(auth,`oat_likes?target_id=eq.${auth.id}&select=user_id`).then(rows)
  ]);
  const unavailable=new Set(busy.map((x:{user_id:string})=>x.user_id));
  return NextResponse.json({me:auth.id,complete,match:null,messages:[],profiles:candidates.filter((p:Member)=>!unavailable.has(p.user_id)).map(visibleMember).filter((p:{age:number})=>p.age>=18),likes:likes.map((x:{target_id:string})=>x.target_id),incoming:incoming.map((x:{user_id:string})=>x.user_id),lastEnd:endedRows[0]??null});
 }catch{return NextResponse.json({error:'Member discovery is temporarily unavailable. Please try again.'},{status:503});}
}
export async function POST(req: NextRequest) {
 if(!sameOrigin(req)) return NextResponse.json({error:'Request not allowed.'},{status:403});
 try {
  const auth=await datingAuth(req);
  if(!auth) return NextResponse.json({error:'Please sign in again with a verified email.'},{status:401});
  const body=await req.json();
  let path:string,payload:Record<string,unknown>;
  if(body.action==='like') {
   if(typeof body.target!=='string' || !/^[0-9a-f-]{36}$/i.test(body.target)) return NextResponse.json({error:'Choose a valid member.'},{status:400});
   path='oat_like';payload={p_actor:auth.id,p_target:body.target};
  }else if(body.action==='end') {
   const reason=typeof body.reason==='string'?body.reason.trim():'';
   if(reason.length<4 || reason.length>240) return NextResponse.json({error:'Give a respectful reason between 4 and 240 characters.'},{status:400});
   path='oat_end_match';payload={p_actor:auth.id,p_reason:reason};
  }else if(body.action==='message') {
   const content=typeof body.content==='string'?body.content.trim():'';
   if(!content || content.length>2000) return NextResponse.json({error:'Messages must contain 1–2,000 characters.'},{status:400});
   path='oat_send_message';payload={p_actor:auth.id,p_content:content};
  }else return NextResponse.json({error:'Unknown action.'},{status:400});
  const response=await database(auth,`rpc/${path}`,{method:'POST',body:JSON.stringify(payload)});
  const result=await response.json();
  if(!response.ok) {
   const allowed=['You cannot match with yourself.','Both people need complete adult profiles.','End your current match before browsing again.','This person is already matched.','No active match.','This match already ended.','You need an active mutual match to message.'];
   return NextResponse.json({error:allowed.includes(result.message)?result.message:'Unable to complete that action. Please refresh and try again.'},{status:409});
  }
  return NextResponse.json(result);
 }catch{return NextResponse.json({error:'Unable to connect. Please try again.'},{status:503});}
}
