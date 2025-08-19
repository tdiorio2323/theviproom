import { NextResponse } from "next/server";
import { VIP_CODES } from "@/lib/env";
import { setVipSession } from "@/lib/session";

export async function POST(req: Request) {
  const { code } = await req.json().catch(() => ({ code: "" }));
  const ok = typeof code === "string" && VIP_CODES.has(code.trim().toLowerCase());
  if (!ok) return NextResponse.json({ message: "Invalid code" }, { status: 401 });
  await setVipSession();
  return NextResponse.json({ ok: true });
}
