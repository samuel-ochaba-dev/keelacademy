#!/usr/bin/env python3
"""Advisory lesson linter (lesson UX spec U9).

Checks:
1. Apparatus pacing: advises when prose stretches exceed ~250 words without apparatus (code, checkpoint, callout).
2. Coda presence: advises if ::: coda is missing.
3. Heading cadence: advises when headings are stacked without intervening prose.

This tool is ADVISORY ONLY (not a gate). Always exits 0.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent


def lint_lesson_file(path: Path) -> list[str]:
    advisories: list[str] = []
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()

    # 1. Check coda presence
    has_coda = bool(re.search(r"^:::\s+coda\b", text, re.MULTILINE))
    if not has_coda:
        advisories.append(f"{path}: advisory: no '::: coda <title>' card found at lesson end.")

    # 2. Check heading cadence and apparatus pacing
    current_word_count = 0
    last_heading_line: int | None = None
    in_fence = False

    apparatus_re = re.compile(
        r"^(```|~~~|>\s*\*\*Predict|>\s*\*\*Gotcha|:::\s+(worked-example|aside|recap|coda|drill))"
    )

    for line_num, line in enumerate(lines, start=1):
        stripped = line.strip()

        if stripped.startswith("```") or stripped.startswith("~~~"):
            in_fence = not in_fence
            if not in_fence:
                # Exiting code fence reset apparatus prose count
                current_word_count = 0
            continue

        if in_fence:
            continue

        # Check for stacked headings
        if stripped.startswith("#"):
            if last_heading_line is not None and (line_num - last_heading_line) <= 2:
                advisories.append(
                    f"{path}:{line_num}: advisory: stacked heading directly after line {last_heading_line} without introductory prose."
                )
            last_heading_line = line_num
            current_word_count = 0
            continue
        elif stripped:
            last_heading_line = None

        # Check for apparatus
        if apparatus_re.match(stripped):
            current_word_count = 0
            continue

        # Accumulate words
        words = [w for w in stripped.split() if w]
        current_word_count += len(words)

        if current_word_count > 250:
            advisories.append(
                f"{path}:{line_num}: advisory: prose block reached ~{current_word_count} words without apparatus interruption (target: <= 250 words)."
            )
            # Reset after warning so we don't spam every line
            current_word_count = 0

    return advisories


def main() -> int:
    files_to_check: list[Path] = []
    if len(sys.argv) > 1:
        for arg in sys.argv[1:]:
            p = Path(arg)
            if p.is_file():
                files_to_check.append(p)
    else:
        files_to_check = sorted(REPO_ROOT.glob("content/units/**/learn.md"))

    total_advisories = 0
    print(f"== Advisory lesson lint against {len(files_to_check)} lesson file(s) ==")

    for f in files_to_check:
        advs = lint_lesson_file(f)
        if advs:
            total_advisories += len(advs)
            for adv in advs:
                print(f"  {adv}")
        else:
            rel = f.relative_to(REPO_ROOT) if f.is_relative_to(REPO_ROOT) else f
            print(f"  {rel}: OK (all pacing & structure advisories pass)")

    print(f"\nAdvisory lint finished: {total_advisories} advisory note(s). (Exit 0: advisory only)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
