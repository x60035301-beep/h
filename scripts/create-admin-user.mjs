import { createClient } from "@supabase/supabase-js";

import { getFirstEnv, loadEnvFiles } from "./env-loader.mjs";

loadEnvFiles();

const email = process.argv[2] || process.env.HOMY_ADMIN_EMAIL || "admin@homyfoam.co.id";
const password = process.argv[3] || process.env.HOMY_ADMIN_PASSWORD;
const fullName = process.argv[4] || process.env.HOMY_ADMIN_NAME || "HOMY Admin";

const required = [
  ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL"],
  ["SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY"]
];

const missing = required.map(getFirstEnv).filter((item) => !item.ok);
if (missing.length) {
  console.error("Missing Supabase admin configuration:");
  for (const item of missing) console.error(`- ${item.name}`);
  process.exit(1);
}

if (!password || password.length < 8) {
  console.error("Usage:");
  console.error("  pnpm admin:create admin@homyfoam.co.id Homy@2026CRM! \"HOMY Admin\"");
  console.error("");
  console.error("Password must be at least 8 characters.");
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

const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
if (listError) {
  console.error(`Unable to list Supabase Auth users: ${listError.message}`);
  process.exit(1);
}

const existing = existingUsers.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
let userId = existing?.id;

if (existing) {
  const { error } = await supabase.auth.admin.updateUserById(existing.id, {
    password,
    email_confirm: true,
    user_metadata: {
      ...existing.user_metadata,
      full_name: fullName
    }
  });

  if (error) {
    console.error(`Unable to update admin auth user: ${error.message}`);
    process.exit(1);
  }
} else {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName
    }
  });

  if (error) {
    console.error(`Unable to create admin auth user: ${error.message}`);
    process.exit(1);
  }

  userId = data.user?.id;
}

if (!userId) {
  console.error("Supabase did not return a user id.");
  process.exit(1);
}

const { data: adminRole, error: roleError } = await supabase.from("roles").select("id").eq("code", "admin").single();
if (roleError || !adminRole) {
  console.error("Admin role was not found. Run supabase/schema.sql first.");
  if (roleError) console.error(roleError.message);
  process.exit(1);
}

const { error: profileError } = await supabase.from("users").upsert(
  {
    id: userId,
    email,
    full_name: fullName,
    role_id: adminRole.id,
    updated_at: new Date().toISOString()
  },
  { onConflict: "id" }
);

if (profileError) {
  console.error(`Unable to promote admin profile: ${profileError.message}`);
  process.exit(1);
}

console.log("Admin account is ready.");
console.log(`Email: ${email}`);
