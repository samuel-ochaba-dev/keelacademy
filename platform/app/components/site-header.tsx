import Link from "next/link";
import { listUnits } from "@/lib/content";
import { getSessionUser } from "@/lib/auth";

export async function SiteHeader() {
  const units = listUnits();
  const first = units[0];
  const user = await getSessionUser();

  return (
    <header>
      <div>
        <Link href="/">
          <span>Keel Academy</span>
        </Link>
      </div>

      <nav aria-label="Main navigation">
        <Link href="/curriculum">Curriculum</Link>
        {user ? <Link href="/map">Map</Link> : null}
        <Link href="/pricing">Pricing</Link>
        <Link href="/submit">Submit</Link>
        <Link href="/faq">FAQ</Link>
      </nav>

      <div>
        {user ? (
          <>
            <Link href="/me">
              <span>{user.name ?? user.email}</span>
            </Link>
            <Link href="/sign-out">Sign out</Link>
          </>
        ) : (
          <>
            <Link href="/sign-in">Sign in</Link>
            {first ? (
              <Link href={`/units/${first.id}`}>
                <span>Start Unit {first.id}</span>
              </Link>
            ) : null}
          </>
        )}
      </div>
    </header>
  );
}
