export function hasSupabaseEnv() {
  const { url, publicKey } = getSupabaseEnvValues();
  return Boolean(url && publicKey);
}

export function hasSupabaseAdminEnv() {
  const { url } = getSupabaseEnvValues();
  return Boolean(url && getSupabaseServiceKey());
}

export function hasEmailWebhookEnv() {
  return Boolean(process.env.EMAIL_WEBHOOK_URL && process.env.EMAIL_FROM);
}

export function getSupabaseEnv() {
  const { url, publicKey } = getSupabaseEnvValues();

  if (!url || !publicKey) {
    throw new Error("Missing Supabase URL or public key.");
  }

  return { url, anonKey: publicKey };
}

export function getSupabaseAdminEnv() {
  const { url } = getSupabaseEnvValues();
  const serviceRoleKey = getSupabaseServiceKey();

  if (!url || !serviceRoleKey) {
    throw new Error("Missing Supabase URL or service key.");
  }

  return { url, serviceRoleKey };
}

function getSupabaseEnvValues() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL,
    publicKey:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.SUPABASE_PUBLISHABLE_KEY
  };
}

function getSupabaseServiceKey() {
  return process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
}
