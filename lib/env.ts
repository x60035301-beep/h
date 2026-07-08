export function hasSupabaseEnv() {
  const { url, publicKey } = getSupabaseEnvValues();
  return Boolean(url && publicKey);
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

function getSupabaseEnvValues() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL,
    publicKey:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.SUPABASE_PUBLISHABLE_KEY
  };
}
