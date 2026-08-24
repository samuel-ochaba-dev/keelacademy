import type { Layer1Check, Layer1Result } from "@/lib/grading";
import { humanizeId } from "@/lib/text";
import { IconTerminal, IconCheckCircle, IconXCircle } from "@/components/icons";

function CheckRow({ check }: { check: Layer1Check }) {
  const isPass = check.status === "pass";

  return (
    <div className="px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {isPass ? (
            <IconCheckCircle size={16} className="text-pass" />
          ) : (
            <IconXCircle size={16} className="text-fail" />
          )}
          <span className="font-mono text-[13px] text-ink">{humanizeId(check.id)}</span>
        </div>

        <div className="flex items-center gap-3">
          {typeof check.wall_s === "number" ? (
            <span className="font-mono text-xs text-ink-3">{check.wall_s.toFixed(2)}s</span>
          ) : null}
          <span className={isPass ? "chip-pass" : "chip-fail"}>{check.status}</span>
        </div>
      </div>

      {check.note ? <p className="mt-2 text-[13px] leading-relaxed text-ink-2">{check.note}</p> : null}

      {check.output_tail ? (
        <details className="group mt-3 [&_summary::-webkit-details-marker]:hidden">
          <summary className="cursor-pointer list-none font-mono text-[11px] tracking-[0.08em] text-ink-3 uppercase transition-colors hover:text-accent">
            Container output
          </summary>
          <pre className="code-block mt-2 text-xs">
            <code>{check.output_tail}</code>
          </pre>
        </details>
      ) : null}
    </div>
  );
}

export function Layer1Section({ layer1 }: { layer1: Layer1Result | null | undefined }) {
  const passCount = layer1?.checks.filter((c) => c.status === "pass").length ?? 0;
  const totalCount = layer1?.checks.length ?? 0;
  const isOverallPass = layer1?.overall === "pass";

  return (
    <section id="layer-1" className="scroll-mt-24">
      <div className="panel overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-inset px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg border border-line bg-raised text-accent">
              <IconTerminal size={18} />
            </span>
            <h2 className="text-base font-semibold text-ink">
              Layer 1: automated sandbox checks
            </h2>
          </div>

          {layer1 ? (
            <span className={isOverallPass ? "chip-pass" : "chip-fail"}>
              {passCount}/{totalCount} passed
            </span>
          ) : null}
        </div>

        {layer1 && layer1.checks.length > 0 ? (
          <div className="divide-y divide-line">
            {layer1.checks.map((check) => (
              <CheckRow key={check.id} check={check} />
            ))}
          </div>
        ) : (
          <p className="px-5 py-4 text-sm text-ink-3">
            No Layer 1 test results recorded for this submission.
          </p>
        )}
      </div>
    </section>
  );
}
