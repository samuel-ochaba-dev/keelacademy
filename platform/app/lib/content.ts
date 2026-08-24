import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { marked } from "marked";

/**
 * The unit-page renderer reads the school's content repo (content/) as data.
 * Nothing on a unit page is hardcoded lesson text: if a file is missing, the
 * section renders an honest "content arriving" state instead of invented copy.
 *
 * The content root is discovered by walking upward from the working directory
 * (platform/app in dev, the repo root in scripts) until content/units exists.
 * KEEL_CONTENT_ROOT overrides, matching the convention platform/grading uses.
 */

const UNIT_ID_PATTERN = /^\d+\.\d+\.\d+$/;

export type LastVerified = { concept_core: string; applied_context: string; tool_specifics: string };

export type MapModule = {
  id: string;
  title: string;
  description: string;
  is_gate?: boolean;
};

export type MapPhase = {
  phase: number;
  id: string;
  title: string;
  est_hours: number;
  why: string;
  outcome: string;
  meridian_role: string;
  gate_id?: string;
  rebate_pct?: number;
  note?: string;
  badge?: string;
  modules: MapModule[];
};

export type CurriculumMap = {
  version: number;
  phases: MapPhase[];
};

export type UnitYaml = {
  id: string;
  phase: number;
  est_hours: number;
  prereq_units: string[];
  last_verified: LastVerified;
  learn: string;
  practice: {
    worked_example: string;
    completion_problem: { base: string; checks: string };
    retrieval_seeds: string[];
  };
  build: { deliverable: string; submission: string; data_variant: string };
  verify: { layers: number[]; deterministic_checks: string; rubric: string };
  gate: { unlocks: string[] };
  unstuck: { symptom: string; fix_ref: string }[];
};

export type RubricCriterion = { id: string; description: string; evidence: string };

export type Rubric = {
  id: string;
  version: number;
  pass_rule: string;
  judge: { prompt: string; model_tier: string };
  golden_set: string;
  criteria: RubricCriterion[];
};

export type Check = {
  id: string;
  type: string;
  run: string;
  expect: string | { output_contains: string };
};

/** The submission contract parsed from the checks file's header comment. */
export type SubmissionContract = {
  files: { path: string; description: string }[];
  cli: string | null;
  note: string | null;
  raw: string[];
};

export type Lesson = {
  idLabel: string | null; // "Unit 3.2.1" when the H1 carries it
  title: string; // the title part of the H1
  subtitle: string | null; // the italic meta line under the H1
  introHtml: string; // framing before the first "---" separator
  layers: { name: string; html: string }[]; // sections between "---" separators
};

export type MarkdownDoc = { title: string | null; html: string };

export type FaqEntry = { anchor: string | null; question: string; html: string };

export type CurriculumAnchor = {
  title: string;
  learn: string | null;
  tools: string | null;
  time: string | null;
  build: string | null;
  proveIt: string | null;
};

export type Unit = {
  yaml: UnitYaml;
  lesson: Lesson | null;
  workedExample: MarkdownDoc | null;
  completionProblem: MarkdownDoc | null;
  checks: Check[] | null;
  contract: SubmissionContract | null;
  rubric: Rubric | null;
  faq: FaqEntry[] | null;
  curriculum: CurriculumAnchor | null;
};

export function findContentRoot(): string {
  const override = process.env.KEEL_CONTENT_ROOT;
  if (override) return override;
  let dir = process.cwd();
  for (let i = 0; i < 8; i += 1) {
    const candidate = path.join(/* turbopackIgnore: true */ dir, "content", "units");
    if (existsSync(candidate)) return path.join(/* turbopackIgnore: true */ dir, "content");
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error(
    "Content root not found: walked up from cwd looking for content/units. Set KEEL_CONTENT_ROOT.",
  );
}

function readIfExists(filePath: string): string | null {
  return existsSync(filePath) ? readFileSync(filePath, "utf8") : null;
}

function renderMarkdown(md: string): string {
  return marked.parse(md.trim(), { async: false }) as string;
}

/** Unit ids are dotted triples; refuse anything that could be path traversal. */
export function assertValidUnitId(unitId: string): void {
  if (!UNIT_ID_PATTERN.test(unitId)) {
    throw new Error(`Invalid unit id: ${unitId}`);
  }
}

/** Units live at content/units/phase-<N>/<id>/; the phase directory is discovered. */
export function findUnitDir(contentRoot: string, unitId: string): string | null {
  const unitsDir = path.join(/* turbopackIgnore: true */ contentRoot, "units");
  for (const entry of readdirSync(unitsDir)) {
    const candidate = path.join(/* turbopackIgnore: true */ unitsDir, entry, unitId);
    if (existsSync(path.join(/* turbopackIgnore: true */ candidate, "unit.yaml"))) return candidate;
  }
  return null;
}

/** All authored units, ascending by phase then id. The landing page lists these. */
export function listUnits(): { id: string; phase: number }[] {
  const contentRoot = findContentRoot();
  const unitsDir = path.join(/* turbopackIgnore: true */ contentRoot, "units");
  const units: { id: string; phase: number }[] = [];
  for (const phaseDir of readdirSync(unitsDir)) {
    const phaseMatch = /^phase-(\d+)$/.exec(phaseDir);
    if (!phaseMatch) continue;
    for (const entry of readdirSync(path.join(/* turbopackIgnore: true */ unitsDir, phaseDir))) {
      if (existsSync(path.join(/* turbopackIgnore: true */ unitsDir, phaseDir, entry, "unit.yaml"))) {
        units.push({ id: entry, phase: Number(phaseMatch[1]) });
      }
    }
  }
  return units.sort((a, b) => a.phase - b.phase || a.id.localeCompare(b.id));
}

export function isUnitAuthored(unitId: string): boolean {
  try {
    const root = findContentRoot();
    return findUnitDir(root, unitId) !== null;
  } catch {
    return false;
  }
}

export function loadCurriculumMap(): CurriculumMap {
  try {
    const contentRoot = findContentRoot();
    const filePath = path.join(/* turbopackIgnore: true */ contentRoot, "curriculum", "phases.yaml");
    if (!existsSync(filePath)) {
      return { version: 1, phases: [] };
    }
    const text = readFileSync(filePath, "utf8");
    return parseYaml(text) as CurriculumMap;
  } catch {
    return { version: 1, phases: [] };
  }
}

function parseLesson(md: string): Lesson {
  const lines = md.split("\n");
  const h1Index = lines.findIndex((line) => line.startsWith("# "));
  const h1 = h1Index >= 0 ? lines[h1Index].slice(2).trim() : null;
  const idLabel = h1 && h1.startsWith("Unit ") ? h1.split(" — ")[0] : null;
  const title = idLabel ? h1!.split(" — ").slice(1).join(" — ") : (h1 ?? "Untitled lesson");

  const subtitleLine = lines.find((line, i) => i > h1Index && /^\*[^*].*\*$/.test(line.trim()));
  const subtitle = subtitleLine ? subtitleLine.trim().replace(/^\*/, "").replace(/\*$/, "") : null;

  const body = lines.slice((h1Index ?? -1) + 1).join("\n");
  const chunks = body.split(/\n-{3,}\n/);
  const introHtml = renderMarkdown(chunks[0] ?? "");
  const layers = chunks.slice(1).map((chunk) => {
    const nameMatch = /^##\s+(.+)$/m.exec(chunk);
    return { name: nameMatch ? nameMatch[1].trim() : "Section", html: renderMarkdown(chunk) };
  });

  return { idLabel, title, subtitle, introHtml, layers };
}

function parseMarkdownDoc(md: string): MarkdownDoc {
  const lines = md.split("\n");
  const h1Index = lines.findIndex((line) => line.startsWith("# "));
  const title = h1Index >= 0 ? lines[h1Index].slice(2).trim() : null;
  return { title, html: renderMarkdown(md) };
}

function parseFaq(md: string): FaqEntry[] {
  const sections = md.split(/^##\s+/m).slice(1);
  return sections.map((section) => {
    const headingEnd = section.indexOf("\n");
    const heading = section.slice(0, headingEnd).trim();
    const anchorMatch = /\{#([^}]+)\}\s*$/.exec(heading);
    return {
      anchor: anchorMatch ? anchorMatch[1] : null,
      question: heading.replace(/\s*\{#[^}]+\}\s*$/, ""),
      html: renderMarkdown(section.slice(headingEnd + 1)),
    };
  });
}

/**
 * The submission contract lives in the checks file's header comment, authored
 * with the checks themselves. Parse it tolerantly: indented "path  description"
 * lines become the files table, a "CLI:" line becomes the command, everything
 * else is kept verbatim. If the shape ever changes, the raw lines still render
 * so the page can never silently invent a contract.
 */
function parseChecksFile(text: string): { checks: Check[]; contract: SubmissionContract | null } {
  const checks = parseYaml(text) as Check[];
  const headerLines: string[] = [];
  for (const rawLine of text.split("\n")) {
    const line = rawLine.trimEnd();
    if (line.startsWith("# ")) headerLines.push(line.slice(2));
    else if (line.startsWith("#")) headerLines.push(line.slice(1));
    else if (line.trim().length > 0) break; // YAML body starts
  }
  if (headerLines.length === 0) return { checks, contract: null };

  const files: { path: string; description: string }[] = [];
  let cli: string | null = null;
  const noteLines: string[] = [];
  let inContract = false;
  for (const line of headerLines) {
    if (/^Submission contract/i.test(line.trim())) {
      inContract = true;
      continue;
    }
    if (!inContract) continue;
    const cliMatch = /^(\s*)CLI:\s*(.+)$/.exec(line);
    if (cliMatch) {
      cli = cliMatch[2].trim();
      continue;
    }
    const fileMatch = /^\s{2,}(\S+)\s{2,}(.+)$/.exec(line);
    if (fileMatch) {
      files.push({ path: fileMatch[1], description: fileMatch[2].trim() });
      continue;
    }
    if (line.trim().length > 0) noteLines.push(line.trim());
  }
  return {
    checks,
    contract: files.length > 0 || cli ? { files, cli, note: noteLines.join(" ") || null, raw: headerLines } : null,
  };
}

/** Pull the unit's entry out of curriculum.md: the Learn/Tools/Time/Build/Prove-it anchor lines. */
function parseCurriculumAnchor(repoRoot: string, unitId: string): CurriculumAnchor | null {
  const md = readIfExists(path.join(/* turbopackIgnore: true */ repoRoot, "curriculum.md"));
  if (!md) return null;
  const lines = md.split("\n");
  const start = lines.findIndex((line) => line.startsWith(`#### ${unitId} `));
  if (start < 0) return null;
  const title = lines[start].replace(`#### ${unitId} `, "").trim();
  const field = (label: string): string | null => {
    for (let i = start + 1; i < lines.length; i += 1) {
      if (/^#{1,4}\s/.test(lines[i])) return null;
      const match = new RegExp(`^- \\*\\*${label}:\\*\\*\\s+(.+)$`).exec(lines[i]);
      if (match) return match[1].trim();
    }
    return null;
  };
  return {
    title,
    learn: field("Learn"),
    tools: field("Tools"),
    time: field("Time"),
    build: field("Build"),
    proveIt: field("Prove it"),
  };
}

export function loadUnit(unitId: string): Unit | null {
  assertValidUnitId(unitId);
  const contentRoot = findContentRoot();
  const unitDir = findUnitDir(contentRoot, unitId);
  if (!unitDir) return null;

  const yamlText = readFileSync(path.join(/* turbopackIgnore: true */ unitDir, "unit.yaml"), "utf8");
  const yaml = parseYaml(yamlText) as UnitYaml;

  const resolve = (relative: string) => path.join(/* turbopackIgnore: true */ contentRoot, relative);

  const lessonMd = yaml.learn ? readIfExists(resolve(yaml.learn)) : null;
  const workedMd = yaml.practice.worked_example
    ? readIfExists(path.join(/* turbopackIgnore: true */ resolve(yaml.practice.worked_example), "README.md"))
    : null;
  const completionMd = yaml.practice.completion_problem.base
    ? readIfExists(
        path.join(/* turbopackIgnore: true */ resolve(yaml.practice.completion_problem.base), "README.md"),
      )
    : null;
  const checksText = yaml.verify.deterministic_checks
    ? readIfExists(resolve(yaml.verify.deterministic_checks))
    : null;
  const rubricText = yaml.verify.rubric ? readIfExists(resolve(yaml.verify.rubric)) : null;
  const faqMd = readIfExists(path.join(/* turbopackIgnore: true */ contentRoot, "faq", `${unitId}.md`));

  const { checks, contract } = checksText ? parseChecksFile(checksText) : { checks: null, contract: null };

  return {
    yaml,
    lesson: lessonMd ? parseLesson(lessonMd) : null,
    workedExample: workedMd ? parseMarkdownDoc(workedMd) : null,
    completionProblem: completionMd ? parseMarkdownDoc(completionMd) : null,
    checks,
    contract,
    rubric: rubricText ? (parseYaml(rubricText) as Rubric) : null,
    faq: faqMd ? parseFaq(faqMd) : null,
    curriculum: parseCurriculumAnchor(path.dirname(contentRoot), unitId),
  };
}
