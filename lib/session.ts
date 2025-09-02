import { cookies } from "next/headers";
import { VIP_COOKIE_DOMAIN, VIP_COOKIE_NAME, VIP_SESSION_MINUTES } from "./env";

export async function setVipSession() {
  const jar = await cookies();
  const expires = new Date(Date.now() + VIP_SESSION_MINUTES * 60 * 1000);
  jar.set(VIP_COOKIE_NAME, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    expires,
    domain: VIP_COOKIE_DOMAIN,
  });
}

export async function clearVipSession() {
  const jar = await cookies();
  jar.set(VIP_COOKIE_NAME, "", { httpOnly: true, sameSite: "lax", secure: true, path: "/", expires: new Date(0), domain: VIP_COOKIE_DOMAIN });
}
