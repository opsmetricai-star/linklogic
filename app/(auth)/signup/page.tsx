import Link from "next/link";
import { AuthCard } from "@/components/AuthCard";
import { signup } from "../actions";

export const metadata = { title: "Create account" };

export default async function Signup({ searchParams }: { searchParams: Promise<{ error?: string; plan?: string }> }) {
  const { error, plan } = await searchParams;
  return (
    <AuthCard title="Create your workspace" error={error} footer={<>Have an account? <Link href="/login" className="underline">Sign in</Link></>}>
      <form action={signup} className="space-y-4">
        <input type="hidden" name="plan" value={plan ?? ""} />
        <div><label className="label" htmlFor="email">Work email</label><input id="email" name="email" type="email" required autoComplete="email" className="input" /></div>
        <div><label className="label" htmlFor="password">Password</label><input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" className="input" /><p className="mt-1 text-xs text-muted">At least 8 characters.</p></div>
        <button className="btn-primary w-full">Create account</button>
      </form>
    </AuthCard>
  );
}
