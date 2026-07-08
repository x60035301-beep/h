import { createClient } from "@supabase/supabase-js";

import { getEnvStatus, getFirstEnv, loadEnvFiles } from "./env-loader.mjs";

loadEnvFiles();

const required = [
  ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL"],
  ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_PUBLISHABLE_KEY"],
  ["SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY"]
];

const optional = ["EMAIL_FROM", "EMAIL_WEBHOOK_URL"];
const statuses = required.map(getFirstEnv);
const optionalStatuses = optional.map(getEnvStatus);
const failed = statuses.filter((item) => !item.ok);

console.log("HOMY CRM production environment check");
console.log("-------------------------------------");

for (const item of statuses) {
  console.log(`${item.ok ? "OK " : "ERR"} ${item.name}${item.placeholder ? " uses a placeholder value" : ""}`);
}

for (const item of optionalStatuses) {
  console.log(`${item.ok ? "OK " : "WARN"} ${item.name}${item.ok ? "" : " is not configured"}`);
}

if (failed.length) {
  console.error("");
  console.error("Missing required production configuration:");
  for (const item of failed) console.error(`- ${item.name}`);
  console.error("");
  console.error("Create .env.local from .env.example and fill real Supabase values.");
  process.exit(1);
}

const supabaseUrl = getFirstEnv(["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL"]).value;
const adminKey = getFirstEnv(["SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY"]).value;

const supabase = createClient(supabaseUrl, adminKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const { data, error } = await supabase.from("roles").select("code").limit(10);

if (error) {
  console.error("");
  console.error("Supabase is reachable, but the CRM schema is not ready or the service role cannot query it.");
  console.error(error.message);
  console.error("");
  console.error("Run supabase/schema.sql, then supabase/seed.sql, then supabase/script_templates.sql.");
  process.exit(1);
}

const roleCodes = new Set((data ?? []).map((role) => role.code));
if (!roleCodes.has("admin") || !roleCodes.has("sales")) {
  console.error("");
  console.error("CRM roles are missing. Run supabase/schema.sql before creating users.");
  process.exit(1);
}

console.log("");
console.log("Production environment is ready.");
