"use server";

import { getSessionUser } from "@/lib/auth";
import { ensureStudent } from "@/lib/enroll";
import {
  submitPracticeAttempt,
  type PracticeAttemptResult,
  type PracticeResult,
} from "@/lib/practice";

export async function runPracticeAttemptAction(
  unitId: string,
  files: Record<string, string>,
): Promise<PracticeResult<PracticeAttemptResult>> {
  const user = await getSessionUser();
  if (!user) {
    return {
      state: "rejected",
      status: 401,
      code: "not_signed_in",
      message: "Sign in required to run practice checks.",
    };
  }

  const studentRes = await ensureStudent(user);
  if (studentRes.state !== "ok") {
    return {
      state: "rejected",
      status: 500,
      code: "student_bridge_failed",
      message: "Unable to load student profile.",
    };
  }

  const studentId = studentRes.data;
  return submitPracticeAttempt({ studentId, unitId, files });
}
