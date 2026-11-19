import Link from "next/link";
import { AuthCard } from "@/components/AuthCard";
import { forgot } from "../actions";

export const metadata = { title: "Reset password" };

export default async function Forgot({ searchParams }: { searchParams: Promise<{ error?: string; notice?: string }> }) {
  const { error, notice } = await searchParams;
  return (
    <AuthCard title="Reset your password" error={error} notice={notice} footer={<Link href="/login" className="underline">Back to sign in</Link>}>
      <form action={forgot} className="space-y-4">
        <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required className="input" /></div>
        <button className="btn-primary w-full">Send reset link</button>
      </form>
    </AuthCard>
  );
}
