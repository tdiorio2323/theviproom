import { cookies } from "next/headers";
import { VIP_COOKIE_NAME } from "./env";

export const getVipCookie = async () => (await cookies()).get(VIP_COOKIE_NAME)?.value;
