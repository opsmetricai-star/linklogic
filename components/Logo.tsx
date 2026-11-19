import Link from "next/link";
import Image from "next/image";

/** Approved LinkLogic mark. The light variant swaps the navy for white so it stays legible on dark surfaces. */
export function Mark({ size = 28 }: { size?: number }) {
  return <Image src="/logo-light.png" alt="" width={size * 1.46} height={size} priority className="h-auto" style={{ width: size * 1.46 }} />;
}

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} aria-label="LinkLogic home" className="flex items-center gap-2.5 font-medium tracking-tight text-display">
      <Mark />
      <span className="text-[17px]">LinkLogic</span>
    </Link>
  );
}
