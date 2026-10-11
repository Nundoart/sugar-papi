import { NextResponse } from "next/server";
export async function POST(){return NextResponse.json({error:"One at a Time is free to join. Paid membership checkout is closed."},{status:410});}
