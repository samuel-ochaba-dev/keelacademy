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
          <strong>Keel Academy</strong>
        </Link>

        <nav>
          <Link href="/submit">
            Submit
          </Link>
          {" | "}
          <a href="/#curriculum">
            Curriculum
          </a>
          {" | "}
          <a href="/#verification">
            Grading
          </a>
          {" | "}
          {user ? (
            <>
              <Link href="/me">
                My progress ({user.email})
              </Link>
              {" | "}
              <Link href="/sign-out">
                Sign out
              </Link>
            </>
          ) : (
            <>
              <Link href="/sign-in">
                Sign in
              </Link>
              {first ? (
                <>
                  {" | "}
                  <Link href={`/units/${first.id}`}>
                    Start unit {first.id}
                  </Link>
                </>
              ) : null}
            </>
          )}
        </nav>
      </div>
      <hr />
    </header>
  );
}
