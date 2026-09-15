import { NextResponse } from "next/server";

export async function POST(){
 const res=NextResponse.json({message:"Signed out."});
 res.cookies.set('sp_access','',{httpOnly:true,path:'/',maxAge:0});
 res.cookies.set('sp_refresh','',{httpOnly:true,path:'/',maxAge:0});
 return res;
}
