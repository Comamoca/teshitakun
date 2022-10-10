import config from "./config.json" assert { type: "json" };

export const customConfig = config;
export const BOT_TOKEN = Deno.env.get("BOT_TOKEN") || "";
export const BOT_ID = BigInt(atob(BOT_TOKEN.split(".")[0]));
