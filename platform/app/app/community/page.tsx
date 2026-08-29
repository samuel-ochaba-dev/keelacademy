import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { ensureStudent } from "@/lib/enroll";
import { fetchPodMembers, fetchPodPosts, PodDetails, PodPost } from "@/lib/practice";
import { PodWorkspace } from "@/components/community/pod-workspace";

export const metadata = {
  title: "Pod Community & Peer Accountability | Keel Academy",
  description:
    "Peer accountability pods of 6–10 engineers with structured weekly check-ins (What shipped, What broke, What's next) and Discord channel integration.",
};

export default async function CommunityPage() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-zinc-100 mb-4">Pod Peer Community</h1>
        <p className="text-zinc-400 mb-8 max-w-md mx-auto text-sm">
          Sign in to access your assigned accountability pod, weekly check-in forms, and Discord channel deep link.
        </p>
        <Link
          href="/sign-in"
          className="inline-flex rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          Sign In
        </Link>
      </main>
    );
  }

  const bridged = await ensureStudent(user);
  if (bridged.state !== "ok") {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="rounded-lg border border-rose-800 bg-rose-950/40 p-6 text-rose-300">
          <p className="font-semibold text-sm">Grading profile unavailable</p>
          <p className="text-xs text-rose-400 mt-1">Please try again in a moment.</p>
        </div>
      </main>
    );
  }

  const studentId = bridged.data;
  const podRes = await fetchPodMembers(studentId);

  let initialPod: PodDetails | null = null;
  let initialPosts: PodPost[] = [];

  if (podRes.state === "ok" && podRes.data.has_pod && podRes.data.pod) {
    initialPod = podRes.data.pod;
    const postsRes = await fetchPodPosts(initialPod.pod_id);
    if (postsRes.state === "ok") {
      initialPosts = postsRes.data.posts;
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
          <span>PEER ACCOUNTABILITY</span>
          <span>•</span>
          <span>STAGE 4.2</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
          Pod Community Workspace
        </h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-3xl">
          Autonomous peer pods grouped by start week (6–10 engineers). Every member submits a mandatory weekly check-in covering <strong>What shipped</strong>, <strong>What broke</strong>, and <strong>What&apos;s next</strong>, synced live to your pod&apos;s Discord channel.
        </p>
      </div>

      <PodWorkspace
        initialPod={initialPod}
        initialPosts={initialPosts}
        studentId={studentId}
      />
    </main>
  );
}
