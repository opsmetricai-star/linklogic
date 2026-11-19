import Link from "next/link";
import { AuthCard } from "@/components/AuthCard";
import { login } from "../actions";

export const metadata = { title: "Sign in" };

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string; notice?: string; next?: string }> }) {
  const { error, notice, next } = await searchParams;
  return (
    <AuthCard title="Sign in" error={error} notice={notice} footer={<>New here? <Link href="/signup" className="underline">Create an account</Link></>}>
      <form action={login} className="space-y-4">
        <input type="hidden" name="next" value={next ?? ""} />
        <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="email" className="input" /></div>
        <div><label className="label" htmlFor="password">Password</label><input id="password" name="password" type="password" required minLength={8} autoComplete="current-password" className="input" /></div>
        <button className="btn-primary w-full">Sign in</button>
        <Link href="/forgot-password" className="block text-center text-sm text-muted underline">Forgot password?</Link>
      </form>
    </AuthCard>
  );
}
