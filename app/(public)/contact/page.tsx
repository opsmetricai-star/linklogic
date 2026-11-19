import type { Metadata } from "next";
import { z } from "zod";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Contact" };

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(200),
  company: z.string().trim().max(100).optional(),
  message: z.string().trim().min(10).max(4000),
});

async function send(formData: FormData) {
  "use server";
  const p = schema.safeParse(Object.fromEntries(formData));
  if (!p.success) redirect("/contact?status=invalid");
  if (formData.get("website")) redirect("/contact?status=sent"); // honeypot
  try {
    const { error } = await createAdminClient().from("contact_messages").insert({ ...p.data, company: p.data.company || null });
    if (error) throw error;
  } catch {
    redirect("/contact?status=error");
  }
  redirect("/contact?status=sent");
}

export default async function Contact({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <p className="eyebrow mb-3">Contact</p>
      <h1 className="text-3xl font-semibold tracking-tight">Tell us what you&apos;re building.</h1>
      {status === "sent" && <p role="status" className="mt-6 rounded border border-ok/40 bg-ok/10 p-3 text-sm text-ok">Thanks, we received your message.</p>}
      {status === "invalid" && <p role="alert" className="mt-6 rounded border border-danger/40 bg-danger/10 p-3 text-sm text-danger">Please check the fields. A valid email and a message of at least 10 characters are required.</p>}
      {status === "error" && <p role="alert" className="mt-6 rounded border border-danger/40 bg-danger/10 p-3 text-sm text-danger">We couldn&apos;t save your message. Please try again later.</p>}
      <form action={send} className="mt-6 space-y-4">
        <div><label className="label" htmlFor="name">Name</label><input id="name" name="name" required className="input" /></div>
        <div><label className="label" htmlFor="email">Work email</label><input id="email" name="email" type="email" required className="input" /></div>
        <div><label className="label" htmlFor="company">Company (optional)</label><input id="company" name="company" className="input" /></div>
        <div><label className="label" htmlFor="message">Message</label><textarea id="message" name="message" required minLength={10} rows={5} className="input" /></div>
        <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        <button className="btn-primary">Send message</button>
      </form>
    </div>
  );
}
