#!/usr/bin/env python3
"""Advisory lesson linter (lesson UX spec U9 + plain-language rules).

Checks:
1. Apparatus pacing: advises when prose stretches exceed ~250 words without apparatus (code, checkpoint, callout).
2. Coda presence: advises if ::: coda is missing.
3. Heading cadence: advises when headings are stacked without intervening prose.
4. Readability (FK grade): advises when Flesch-Kincaid Grade Level exceeds 9.0 (target for global audience).
5. Long sentences: advises on any sentence exceeding 25 words.

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


def _count_syllables(word: str) -> int:
    """Rough syllable count for Flesch-Kincaid estimation."""
    word = word.lower().strip(".,;:!?()[]\"'-")
    if len(word) <= 3:
        return 1
    count = 0
    vowels = "aeiouy"
    prev_vowel = False
    for ch in word:
        is_vowel = ch in vowels
        if is_vowel and not prev_vowel:
            count += 1
        prev_vowel = is_vowel
    if word.endswith("e"):
        count -= 1
    return max(count, 1)


def _extract_prose(text: str) -> str:
    """Strip code blocks, tables, markers, headings, and blockquotes to get pure prose."""
    cleaned = re.sub(r"```[\s\S]*?```", "", text)
    cleaned = re.sub(r"~~~[\s\S]*?~~~", "", cleaned)
    lines = []
    for line in cleaned.splitlines():
        s = line.strip()
        if not s:
            continue
        if s.startswith("#") or s.startswith("|") or s.startswith(":::") or s.startswith(">"):
            continue
        if s.startswith("- ") or s.startswith("* ") or re.match(r"^\d+\.\s", s):
            # Keep list items as prose
            pass
        lines.append(s)
    return " ".join(lines)


def lint_readability(path: Path) -> list[str]:
    """Advisory readability checks: FK grade level and long sentences."""
    advisories: list[str] = []
    text = path.read_text(encoding="utf-8")
    prose = _extract_prose(text)
    if not prose.strip():
        return advisories

    # Split into sentences
    sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", prose) if s.strip()]
    if not sentences:
        return advisories

    # Long sentence check
    for i, sent in enumerate(sentences, start=1):
        wc = len(sent.split())
        if wc > 25:
            preview = sent[:100] + ("..." if len(sent) > 100 else "")
            advisories.append(
                f"{path}: advisory: sentence {i} has {wc} words (target: <= 25): \"{preview}\""
            )

    # Flesch-Kincaid Grade Level
    prose_words = prose.split()
    total_syllables = sum(_count_syllables(w) for w in prose_words)
    avg_syllables = total_syllables / len(prose_words) if prose_words else 0
    avg_sentence_len = len(prose_words) / len(sentences) if sentences else 0
    fkgl = (0.39 * avg_sentence_len) + (11.8 * avg_syllables) - 15.59
    fre = 206.835 - (1.015 * avg_sentence_len) - (84.6 * avg_syllables)

    if fkgl > 9.0:
        advisories.append(
            f"{path}: advisory: Flesch-Kincaid Grade Level is {fkgl:.1f} (target: <= 9.0 for global audience). "
            f"Flesch Reading Ease: {fre:.1f}. Try shorter sentences and simpler words."
        )
    else:
        rel = path.relative_to(REPO_ROOT) if path.is_relative_to(REPO_ROOT) else path
        advisories.append(
            f"{rel}: readability OK (FK Grade {fkgl:.1f}, Flesch RE {fre:.1f})"
        )

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
        advs += lint_readability(f)
        if advs:
            total_advisories += len(advs)
            for adv in advs:
                print(f"  {adv}")
        else:
            rel = f.relative_to(REPO_ROOT) if f.is_relative_to(REPO_ROOT) else f
            print(f"  {rel}: OK (all pacing, structure \u0026 readability advisories pass)")

    print(f"\nAdvisory lint finished: {total_advisories} advisory note(s). (Exit 0: advisory only)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
