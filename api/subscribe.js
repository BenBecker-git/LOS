import { Redis } from "@upstash/redis";
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  // accept JSON or form-data
  let email = "";
  const ct = req.headers.get("content-type") || "";
  try {
    if (ct.includes("application/json")) {
      const body = await req.json();
      email = (body.email || "").toString();
    } else {
      const form = await req.formData();
      email = (form.get("email") || "").toString();
    }
  } catch (_) {}

  email = email.trim().toLowerCase();

  // more permissive check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return new Response("Bad email", { status: 400 });
  }


  await redis.sadd("los:emails", email); // unique
  return new Response("OK", { status: 200 });
}
