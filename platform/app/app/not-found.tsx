import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      <p><strong>404 Error</strong></p>
      <h1>Page Not Found</h1>
      <p>
        The requested resource does not exist or has moved.
      </p>
      <p>
        <Link href="/">
          Return to Homepage
        </Link>
        {" | "}
        <Link href="/submit">
          Submission Guide
        </Link>
      </p>
    </div>
  );
}
