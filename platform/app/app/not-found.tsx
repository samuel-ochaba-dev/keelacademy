import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      <div>
        
        <span>HTTP 404 · ROUTE TARGET NOT FOUND</span>
      </div>

      <h1>
        We couldn&apos;t find that page.
      </h1>

      <p>
        The link may have moved, or that unit isn&apos;t published yet. Check the curriculum map to explore available units.
      </p>

      <div>
        <Link href="/">
          <span>RETURN HOME</span>
        </Link>
        <Link href="/curriculum">
          <span>VIEW CURRICULUM</span>
        </Link>
      </div>
    </div>
  );
}
