"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const creds = z.object({ email: z.string().trim().email().max(200), password: z.string().min(8).max(128) });

async function origin() {
  const h = await headers();
  return process.env.NEXT_PUBLIC_SITE_URL || `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
}
const safeNext = (n: FormDataEntryValue | null) => (typeof n === "string" && /^\/dashboard(\/[\w\-/]*)?$/.test(n) ? n : "/dashboard");
const enc = (s: string) => encodeURIComponent(s);

export async function login(formData: FormData) {
  const p = creds.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!p.success) redirect("/login?error=" + enc("Enter a valid email and a password of at least 8 characters."));
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(p.data);
  if (error) redirect("/login?error=" + enc("Incorrect email or password."));
  redirect(safeNext(formData.get("next")));
}

export async function signup(formData: FormData) {
  const p = creds.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!p.success) redirect("/signup?error=" + enc("Enter a valid email and a password of at least 8 characters."));
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    ...p.data,
    options: { emailRedirectTo: `${await origin()}/auth/callback` },
  });
  if (error) redirect("/signup?error=" + enc(error.message));
  if (data.session) redirect("/dashboard");
  redirect("/login?notice=" + enc("Check your email to confirm your account, then sign in."));
}

export async function forgot(formData: FormData) {
  const email = z.string().email().safeParse(formData.get("email"));
  if (!email.success) redirect("/forgot-password?error=" + enc("Enter a valid email."));
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email.data, { redirectTo: `${await origin()}/auth/callback?next=/reset-password` });
  // Same response whether or not the account exists.
  redirect("/forgot-password?notice=" + enc("If that email has an account, a reset link is on its way."));
}

export async function resetPassword(formData: FormData) {
  const pw = z.string().min(8).max(128).safeParse(formData.get("password"));
  if (!pw.success) redirect("/reset-password?error=" + enc("Password must be at least 8 characters."));
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: pw.data });
  if (error) redirect("/reset-password?error=" + enc("Reset link expired. Request a new one."));
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
