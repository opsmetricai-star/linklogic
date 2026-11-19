import { AuthCard } from "@/components/AuthCard";
import { resetPassword } from "../actions";

export const metadata = { title: "Choose a new password" };

export default async function Reset({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <AuthCard title="Choose a new password" error={error}>
      <form action={resetPassword} className="space-y-4">
        <div><label className="label" htmlFor="password">New password</label><input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" className="input" /></div>
        <button className="btn-primary w-full">Update password</button>
      </form>
    </AuthCard>
  );
}
