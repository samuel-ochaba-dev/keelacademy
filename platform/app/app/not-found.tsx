import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      <h1>404 — Page Not Found</h1>
      <p>The requested page does not exist.</p>
      <ul>
        <li><Link href="/">Home</Link></li>
        <li><Link href="/me">Dashboard</Link></li>
        <li><Link href="/curriculum">Curriculum</Link></li>
      </ul>
    </div>
  );
}
