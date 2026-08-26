/**
 * Server-side client for the practice grading service
 * (platform/grading/practice/server.py).
 *
 * Same security discipline as enroll.ts: the app holds KEEL_PRACTICE_URL
 * (plain base URL) and KEEL_ENROLL_SECRET (shared app token in server env only,
 * never NEXT_PUBLIC).
 *
 * Every call is server-side only; import exclusively from server components
 * and server actions.
 */

export type PracticeManifest = {
  unit_id: string;
  base_rel: string;
  readme_markdown: string;
  base_files: Record<string, string>;
  editable_files: string[];
  checks: { id: string; type: string }[];
};

export type PracticeCheckResult = {
  id: string;
  type: string;
  status: "pass" | "fail" | "error";
  note: string;
  wall_s: number | null;
  exit_code: number | null;
  container_status: string | null;
  output_tail: string | null;
};

export type PracticeAttemptResult = {
  ok: boolean;
  attempt_id: number;
  student_id: number;
  unit_id: string;
  passed: boolean;
  pass_count: number;
  total_checks: number;
  checks: PracticeCheckResult[];
  created_at: string;
};

export type PracticeAttemptSummary = {
  id: number;
  student_id: number;
  unit_id: string;
  passed: boolean;
  pass_count: number;
  total_checks: number;
  checks: PracticeCheckResult[];
  created_at: string;
};

export type RetrievalSeed = {
  index: number;
  prompt: string;
};

export type RetrievalAttemptResult = {
  ok: boolean;
  attempt_id: number;
  student_id: number;
  unit_id: string;
  seed_index: number;
  seed_prompt: string;
  passed: boolean;
  feedback: string;
  evidence: string;
  tokens_charged: number;
  created_at: string;
};

export type RetrievalAttemptSummary = {
  id: number;
  student_id: number;
  unit_id: string;
  seed_index: number;
  seed_prompt: string;
  passed: boolean;
  feedback: string;
  evidence: string;
  tokens_charged: number;
  created_at: string;
};

export type PracticeResult<T> =
  | { state: "ok"; data: T }
  | { state: "unreachable"; detail: string }
  | { state: "rejected"; status: number; code: string; message?: string };

export function practiceBaseUrl(): string {
  return process.env.KEEL_PRACTICE_URL ?? "http://127.0.0.1:8792";
}

function practiceToken(): string | null {
  return process.env.KEEL_ENROLL_SECRET ?? null;
}

async function practiceFetch<T>(path: string, init?: RequestInit): Promise<PracticeResult<T>> {
  const token = practiceToken();
  if (!token) {
    return { state: "rejected", status: 0, code: "app_not_configured" };
  }
  try {
    const res = await fetch(`${practiceBaseUrl()}${path}`, {
      ...init,
      cache: "no-store",
      headers: {
        "X-Keel-App-Token": token,
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
    if (res.ok) {
      return { state: "ok", data: (await res.json()) as T };
    }
    let code = `http_${res.status}`;
    let message: string | undefined;
    try {
      const errObj = (await res.json()) as { error?: string; message?: string };
      code = errObj.error ?? code;
      message = errObj.message;
    } catch {
      // non-JSON error body: keep http status code
    }
    return { state: "rejected", status: res.status, code, message };
  } catch (err) {
    return {
      state: "unreachable",
      detail: err instanceof Error ? err.message : String(err),
    };
  }
}

export function fetchPracticeManifest(unitId: string): Promise<PracticeResult<PracticeManifest>> {
  return practiceFetch<PracticeManifest>(`/practice/manifest?unit=${encodeURIComponent(unitId)}`);
}

export function submitPracticeAttempt(input: {
  studentId: number;
  unitId: string;
  files: Record<string, string>;
}): Promise<PracticeResult<PracticeAttemptResult>> {
  return practiceFetch<PracticeAttemptResult>("/practice/attempt", {
    method: "POST",
    body: JSON.stringify({
      student_id: input.studentId,
      unit_id: input.unitId,
      files: input.files,
    }),
  });
}

export function fetchPracticeAttempts(
  studentId: number,
  unitId: string,
): Promise<PracticeResult<{ attempts: PracticeAttemptSummary[] }>> {
  return practiceFetch<{ attempts: PracticeAttemptSummary[] }>(
    `/practice/attempts?student_id=${studentId}&unit=${encodeURIComponent(unitId)}`,
  );
}

export function fetchRetrievalSeeds(
  unitId: string,
): Promise<PracticeResult<{ unit_id: string; seeds: RetrievalSeed[] }>> {
  return practiceFetch<{ unit_id: string; seeds: RetrievalSeed[] }>(
    `/practice/retrieval/seeds?unit=${encodeURIComponent(unitId)}`,
  );
}

export function submitRetrievalAttempt(input: {
  studentId: number;
  unitId: string;
  seedIndex: number;
  seedPrompt: string;
  answer: string;
}): Promise<PracticeResult<RetrievalAttemptResult>> {
  return practiceFetch<RetrievalAttemptResult>("/practice/retrieval/attempt", {
    method: "POST",
    body: JSON.stringify({
      student_id: input.studentId,
      unit_id: input.unitId,
      seed_index: input.seedIndex,
      seed_prompt: input.seedPrompt,
      answer: input.answer,
    }),
  });
}

export function fetchRetrievalAttempts(
  studentId: number,
  unitId: string,
): Promise<PracticeResult<{ attempts: RetrievalAttemptSummary[] }>> {
  return practiceFetch<{ attempts: RetrievalAttemptSummary[] }>(
    `/practice/retrieval/attempts?student_id=${studentId}&unit=${encodeURIComponent(unitId)}`,
  );
}
