import Link from "next/link";

export function Mark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="6" fill="#12372C" />
      <path d="M7 7v8a2 2 0 0 0 2 2h8" stroke="#C8F560" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <circle cx="7" cy="7" r="1.6" fill="#C8F560" />
      <circle cx="17" cy="17" r="1.6" fill="#C8F560" />
    </svg>
  );
}

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-semibold tracking-tight">
      <Mark />
      <span>LinkLogic</span>
    </Link>
  );
}
