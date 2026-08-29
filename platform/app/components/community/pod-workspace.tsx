"use client";

import React, { useState } from "react";
import { PodDetails, PodPost } from "@/lib/practice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type PodWorkspaceProps = {
  initialPod: PodDetails | null;
  initialPosts: PodPost[];
  studentId: number;
};

export function PodWorkspace({ initialPod, initialPosts, studentId }: PodWorkspaceProps) {
  const [pod, setPod] = useState<PodDetails | null>(initialPod);
  const [posts, setPosts] = useState<PodPost[]>(initialPosts);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form fields for weekly post
  const [weekNumber, setWeekNumber] = useState<number>(1);
  const [shippedText, setShippedText] = useState("");
  const [brokeText, setBrokeText] = useState("");
  const [nextText, setNextText] = useState("");

  const handleJoinPod = async () => {
    setIsAssigning(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/pod/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok) {
        // Refresh pod members
        const memRes = await fetch("/api/pod/members");
        if (memRes.ok) {
          const memData = await memRes.json();
          if (memData.has_pod) {
            setPod(memData.pod);
            // Fetch initial posts for the pod
            const postRes = await fetch(`/api/pod/posts?pod_id=${memData.pod.pod_id}`);
            if (postRes.ok) {
              const postData = await postRes.json();
              setPosts(postData.posts || []);
            }
          }
        }
      } else {
        setErrorMsg(data.message || data.error || "Failed to join pod.");
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Network error");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pod) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/pod/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pod_id: pod.pod_id,
          week_number: weekNumber,
          shipped_text: shippedText,
          broke_text: brokeText,
          next_text: nextText,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Week ${weekNumber} accountability check-in posted successfully!`);
        setShippedText("");
        setBrokeText("");
        setNextText("");
        // Reload posts
        const postRes = await fetch(`/api/pod/posts?pod_id=${pod.pod_id}`);
        if (postRes.ok) {
          const postData = await postRes.json();
          setPosts(postData.posts || []);
        }
      } else {
        setErrorMsg(data.message || data.error || "Failed to submit post.");
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!pod) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center border-zinc-800 bg-zinc-900/60">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mb-4">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-zinc-100 mb-2">No Active Pod Assignment</h2>
          <p className="text-zinc-400 max-w-md mx-auto mb-6 text-sm">
            You are not currently assigned to a peer accountability pod. Pods consist of 6–10 enrolled engineers in your cohort week for mandatory weekly check-ins.
          </p>
          {errorMsg && (
            <div className="mb-4 text-xs text-rose-400 font-mono bg-rose-950/40 p-2.5 rounded border border-rose-800/60 max-w-md mx-auto">
              {errorMsg}
            </div>
          )}
          <Button
            onClick={handleJoinPod}
            disabled={isAssigning}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
          >
            {isAssigning ? "Assigning to Pod..." : "Join Cohort Pod"}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Pod Overview Header */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-6 backdrop-blur">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-zinc-100">{pod.name}</h2>
              <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-mono text-xs">
                {pod.cohort_week}
              </Badge>
              <Badge variant="outline" className="border-zinc-700 bg-zinc-800 text-zinc-300 text-xs">
                {pod.peers.length} Members
              </Badge>
            </div>
            <p className="text-xs text-zinc-400">
              Assigned cohort week {pod.cohort_week}. Weekly check-ins required every Sunday.
            </p>
          </div>

          {pod.discord_channel_id && (
            <div>
              <a
                href={pod.discord_channel_url || `https://discord.com/channels/@me/${pod.discord_channel_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white px-4 py-2 text-xs font-semibold shadow-sm transition-colors"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                <span>Open Discord Channel</span>
              </a>
            </div>
          )}
        </div>

        {/* Pod Peers Grid */}
        <div className="mt-6 pt-5 border-t border-zinc-800/80">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Pod Peers (6–10 Engineers)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {pod.peers.map((peer) => (
              <div
                key={peer.student_id}
                className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                  peer.is_self
                    ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-300"
                    : "border-zinc-800 bg-zinc-950/40 text-zinc-300"
                }`}
              >
                <div className={`h-2 w-2 rounded-full ${peer.is_self ? "bg-emerald-400" : "bg-zinc-600"}`} />
                <span className="truncate font-medium">
                  {peer.display_name} {peer.is_self && "(You)"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Layout: Post Form + Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Weekly Check-In Submission Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 border-zinc-800 bg-zinc-900/60">
            <h3 className="text-base font-bold text-zinc-100 mb-1">Submit Weekly Post</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Enforce the 3 mandatory pillars. All check-ins are recorded and relayed to your pod&apos;s Discord channel.
            </p>

            {errorMsg && (
              <div className="mb-4 text-xs text-rose-400 font-mono bg-rose-950/40 p-2.5 rounded border border-rose-800/60">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="mb-4 text-xs text-emerald-400 font-mono bg-emerald-950/40 p-2.5 rounded border border-emerald-800/60">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmitPost} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Week Number
                </label>
                <input
                  type="number"
                  min="1"
                  max="52"
                  value={weekNumber}
                  onChange={(e) => setWeekNumber(parseInt(e.target.value, 10) || 1)}
                  className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-400 mb-1">
                  1. What Shipped
                </label>
                <textarea
                  rows={3}
                  value={shippedText}
                  onChange={(e) => setShippedText(e.target.value)}
                  placeholder="Units passed, code merged, deliverables completed..."
                  className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-400 mb-1">
                  2. What Broke
                </label>
                <textarea
                  rows={3}
                  value={brokeText}
                  onChange={(e) => setBrokeText(e.target.value)}
                  placeholder="Tests failed, assumptions violated, stuck points encountered..."
                  className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-sky-400 mb-1">
                  3. What&apos;s Next
                </label>
                <textarea
                  rows={3}
                  value={nextText}
                  onChange={(e) => setNextText(e.target.value)}
                  placeholder="Target unit milestones for next week, upcoming builds..."
                  className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2"
              >
                {isSubmitting ? "Relaying to Discord..." : "Post Weekly Check-In"}
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Column: Pod Submissions Feed (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-zinc-100">Pod Accountability Feed</h3>
            <span className="text-xs text-zinc-400">{posts.length} Check-ins</span>
          </div>

          {posts.length === 0 ? (
            <Card className="p-8 text-center border-zinc-800 bg-zinc-900/40">
              <p className="text-xs text-zinc-500">
                No weekly posts have been submitted yet for this pod. Be the first to share what shipped!
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id} className="p-5 border-zinc-800 bg-zinc-900/70 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-zinc-200">{post.author_name}</span>
                      <Badge variant="outline" className="border-zinc-700 bg-zinc-800/60 text-zinc-300 text-[10px] font-mono">
                        Week {post.week_number}
                      </Badge>
                      {post.student_id === studentId && (
                        <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-[10px]">
                          You
                        </Badge>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="font-semibold text-emerald-400 block text-[11px] mb-0.5">What Shipped:</span>
                      <p className="text-zinc-300 bg-zinc-950/50 p-2 rounded border border-zinc-800/60 whitespace-pre-wrap">
                        {post.shipped_text}
                      </p>
                    </div>

                    <div>
                      <span className="font-semibold text-amber-400 block text-[11px] mb-0.5">What Broke:</span>
                      <p className="text-zinc-300 bg-zinc-950/50 p-2 rounded border border-zinc-800/60 whitespace-pre-wrap">
                        {post.broke_text}
                      </p>
                    </div>

                    <div>
                      <span className="font-semibold text-sky-400 block text-[11px] mb-0.5">What&apos;s Next:</span>
                      <p className="text-zinc-300 bg-zinc-950/50 p-2 rounded border border-zinc-800/60 whitespace-pre-wrap">
                        {post.next_text}
                      </p>
                    </div>
                  </div>

                  {post.discord_message_id && (
                    <div className="pt-2 flex items-center gap-1.5 text-[10px] text-zinc-500">
                      <svg className="h-3.5 w-3.5 fill-[#5865F2]" viewBox="0 0 24 24">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                      </svg>
                      <span>Relayed to Discord</span>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
