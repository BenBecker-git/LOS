import { Redis } from "@upstash/redis";
const redis = new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN });

export const config = { runtime: "edge" };
export default async function handler(req) {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  const form = await req.formData();
  const email = (form.get("email")||"").toString().trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return new Response("Bad email", { status: 400 });
  await redis.srem("los:emails", email);           // remove if present
  return new Response("Unsubscribed", { status: 200 });
}
