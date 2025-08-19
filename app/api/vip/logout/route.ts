import { NextResponse } from "next/server";
import { clearVipSession } from "@/lib/session";

export async function POST() {
  await clearVipSession();
  return NextResponse.json({ ok: true });
}
