import type { Metadata } from "next";
import Link from "next/link";
import { listUnits } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "[Submission Guide Title Placeholder]",
  description: "[Submission Guide Description Placeholder]",
};

const STATUS_NOTES = [
  { name: "queued", body: "[Queued Status Description Placeholder]" },
  { name: "grading", body: "[Grading Status Description Placeholder]" },
  { name: "graded", body: "[Graded Status Description Placeholder]" },
  { name: "error", body: "[Error Status Description Placeholder]" },
];

export default function SubmitPage() {
  const units = listUnits();
  const first = units[0];

  return (
    <div>
      {/* Header */}
      <header>
        <p><strong>[Section Tag Placeholder]</strong></p>
        <h1>[Submission Guide Headline Placeholder]</h1>
        <p>
          [Submission Guide Subtitle Placeholder: Instructions on how repositories are pushed and graded.]
        </p>
      </header>

      <hr />

      {/* 1. What you push */}
      <section>
        <h2>1. [Section 1: Repository Setup Placeholder]</h2>
        <div>
          <h3>[Repository Naming Convention Placeholder]</h3>
          <p>
            [Repository naming explanation placeholder]:
          </p>
          <pre>
            <code>keel-{first ? first.id : "3.2.1"}-[identifier-placeholder]</code>
          </pre>

          <h3>[Contract Compliance Placeholder]</h3>
          <p>
            [Contract instructions placeholder]:
          </p>
          {first ? (
            <p>
              <Link href={`/units/${first.id}#build`}>
                [View Unit {first.id} Contract Link]
              </Link>
            </p>
          ) : null}
        </div>
      </section>

      <hr />

      {/* 2. Step by step lifecycle */}
      <section>
        <h2>2. [Section 2: Grading Lifecycle Steps Placeholder]</h2>
        <ol>
          <li>
            <strong>[Lifecycle Step 1 Title Placeholder]</strong>
            <p>[Lifecycle Step 1 Description Placeholder]</p>
          </li>
          <li>
            <strong>[Lifecycle Step 2 Title Placeholder]</strong>
            <p>[Lifecycle Step 2 Description Placeholder]</p>
            <pre>
              <code>keel: [Submission Terminal Output Message Placeholder]</code>
            </pre>
          </li>
          <li>
            <strong>[Lifecycle Step 3 Title Placeholder]</strong>
            <p>[Lifecycle Step 3 Description Placeholder]</p>
          </li>
          <li>
            <strong>[Lifecycle Step 4 Title Placeholder]</strong>
            <p>[Lifecycle Step 4 Description Placeholder]</p>
          </li>
        </ol>
      </section>

      <hr />

      {/* 3. Status taxonomy */}
      <section>
        <h2>3. [Section 3: Status Meanings Placeholder]</h2>
        <dl>
          {STATUS_NOTES.map((status) => (
            <div key={status.name}>
              <dt><strong>{status.name.toUpperCase()}</strong></dt>
              <dd><p>{status.body}</p></dd>
            </div>
          ))}
        </dl>
      </section>

      <hr />

      {/* 4. Accounts & Linking */}
      <section>
        <h2>[Section 4: Account Linking Placeholder]</h2>
        <p>
          [Account linking instructions placeholder]:{" "}
          <Link href="/me">
            [Learner Dashboard Link]
          </Link>
        </p>
      </section>
    </div>
  );
}
