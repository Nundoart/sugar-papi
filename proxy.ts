import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest){
  if(req.nextUrl.pathname.startsWith('/dashboard') && !req.cookies.get('sp_refresh')?.value && !req.cookies.get('sp_access')?.value){
    const url=req.nextUrl.clone();
    url.pathname='/account';
    url.searchParams.set('next','/dashboard');
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config={matcher:['/dashboard/:path*']};
