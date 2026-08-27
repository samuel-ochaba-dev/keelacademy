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

export type RecheckSeedStatus = "upcoming" | "due" | "retired";

export type RecheckSeed = {
  unit_id: string;
  seed_index: number;
  seed_prompt: string;
  stage: number;
  status: RecheckSeedStatus;
  last_pass_at: string | null;
  due_at: string | null;
};

export type RecheckSchedule = {
  student_id: number;
  now: string;
  due_count: number;
  seeds: RecheckSeed[];
};

export type PracticeRouteStep = {
  id: "lesson" | "retrieval" | "worked_example" | "completion";
  title: string;
  type: "concept" | "drill" | "scaffold" | "workbench";
  status: "done" | "current" | "upcoming" | "optional" | "scaffold" | "retry";
  passed_count?: number;
  total_count?: number;
  summary: string;
};

export type ScaffoldCallout = {
  type: "drill_retry" | "completion_retry";
  seed_index?: number;
  seed_prompt?: string;
  target_file: string;
  target_section: string;
  anchor: string;
  url: string;
  summary: string;
  action_label: string;
};

export type PracticeRouteData = {
  student_id: number;
  unit_id: string;
  enrolled: boolean;
  status: "in_progress" | "fast_pass" | "scaffold_active" | "standard" | "completed" | "unenrolled";
  recommended_step: "lesson" | "retrieval" | "worked_example" | "completion" | "build" | null;
  fast_pass_eligible: boolean;
  fast_pass_active: boolean;
  scaffold_active: boolean;
  summary: string;
  steps: PracticeRouteStep[];
  scaffold_callout: ScaffoldCallout | null;
  scaffold_mapping?: {
    seed_index: number;
    seed_prompt: string;
    target_file: string;
    target_section: string;
    anchor: string;
    url: string;
    summary: string;
  }[];
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

export function fetchRecheckSchedule(
  studentId: number,
  unitId?: string,
): Promise<PracticeResult<RecheckSchedule>> {
  const unitParam = unitId ? `&unit=${encodeURIComponent(unitId)}` : "";
  return practiceFetch<RecheckSchedule>(
    `/practice/retrieval/schedule?student_id=${studentId}${unitParam}`,
  );
}

export function fetchPracticeRoute(
  studentId: number,
  unitId: string,
): Promise<PracticeResult<PracticeRouteData>> {
  return practiceFetch<PracticeRouteData>(
    `/practice/route?student_id=${studentId}&unit=${encodeURIComponent(unitId)}`,
  );
}
