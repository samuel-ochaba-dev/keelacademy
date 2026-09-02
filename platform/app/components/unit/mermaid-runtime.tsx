"use client";

import { useEffect } from "react";

/**
 * Draws the `mermaid` fences on a lesson page, lazily.
 *
 * Why this is client-side at all: mermaid measures text to lay out a graph, so it
 * needs a real browser. This machine has none that can run headless (the bundled
 * Chromium is missing five shared libraries and there is no system browser), so
 * prerendering to SVG at build time is not available. If that ever changes, the
 * upgrade path is committing the SVG beside the unit and having this component
 * prefer it.
 *
 * What keeps it honest: the markdown renderer already emitted the diagram's own
 * source inside the frame. That is what a reader sees before this runs, with
 * JavaScript disabled, and if the import fails. No spinner, no skeleton, no empty
 * box that implies something is coming.
 *
 * What keeps it cheap: mermaid pulls d3, dagre, cytoscape and katex, so it is a
 * large chunk. The dynamic import happens on the first diagram that comes near
 * the viewport, which means a page whose diagrams are never scrolled to never
 * pays for it, and the initial bundle never carries it.
 */

const THEME_VARIABLES = {
  background: "#0f1211",
  primaryColor: "#151918",
  primaryTextColor: "#d5dad2",
  primaryBorderColor: "#283327",
  secondaryColor: "#1c261e",
  secondaryTextColor: "#d5dad2",
  secondaryBorderColor: "#283327",
  tertiaryColor: "#0f1211",
  tertiaryTextColor: "#b0b8ac",
  tertiaryBorderColor: "#283327",
  lineColor: "#8a9585",
  textColor: "#b0b8ac",
  mainBkg: "#151918",
  nodeBorder: "#283327",
  nodeTextColor: "#d5dad2",
  clusterBkg: "#0f1211",
  clusterBorder: "#283327",
  edgeLabelBackground: "#0f1211",
  titleColor: "#f4f4f6",
  fontFamily: "var(--font-inter-variable)",
  fontSize: "14px",
};

export function MermaidRuntime() {
  useEffect(() => {
    const frames = Array.from(
      document.querySelectorAll<HTMLElement>("[data-keel-diagram] > .diagram-frame"),
    ).filter((frame) => !frame.dataset.keelDrawn);
    if (frames.length === 0) return;

    let cancelled = false;
    let loading: Promise<typeof import("mermaid").default> | null = null;

    /** One shared, initialised mermaid, however many diagrams the page has. */
    const load = () => {
      loading ??= import("mermaid").then(({ default: mermaid }) => {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "base",
          themeVariables: THEME_VARIABLES,
          flowchart: { curve: "basis", padding: 12, useMaxWidth: true },
        });
        return mermaid;
      });
      return loading;
    };

    const draw = async (frame: HTMLElement, index: number) => {
      const source = frame.querySelector<HTMLElement>("pre.diagram-source");
      const definition = source?.textContent?.trim();
      if (!source || !definition) return;
      frame.dataset.keelDrawn = "pending";

      let svg: string;
      try {
        const mermaid = await load();
        if (cancelled) return;
        ({ svg } = await mermaid.render(`keel-diagram-${index}`, definition));
      } catch (error) {
        // The source is already on the page and stays there. Nothing to undo.
        console.warn("[mermaid] diagram left as source:", error);
        frame.dataset.keelDrawn = "failed";
        return;
      }
      if (cancelled) return;

      // The caption is the diagram's description, so it is also its alt text.
      const caption = frame.parentElement?.querySelector("figcaption")?.textContent?.trim();

      const holder = document.createElement("div");
      holder.className = "diagram-svg";
      holder.innerHTML = svg;
      const node = holder.querySelector("svg");
      if (node) {
        node.setAttribute("role", "img");
        node.removeAttribute("aria-roledescription");
        if (caption) node.setAttribute("aria-label", caption);
        node.style.removeProperty("max-width");
      }

      // The source moves rather than being thrown away: a reader who wants the
      // graph as text, or wants to copy it, can still get to it. It goes last in
      // the figure, below the caption, because the caption describes the drawing.
      const reveal = document.createElement("details");
      reveal.className = "reveal diagram-reveal";
      const summary = document.createElement("summary");
      summary.textContent = "Show the diagram source";
      const body = document.createElement("div");
      body.className = "reveal-body";
      body.appendChild(source);
      reveal.append(summary, body);

      frame.replaceChildren(holder);
      (frame.parentElement ?? frame).append(reveal);
      frame.dataset.keelDrawn = "done";
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          const frame = entry.target as HTMLElement;
          void draw(frame, frames.indexOf(frame));
        }
      },
      { rootMargin: "400px 0px" },
    );
    for (const frame of frames) observer.observe(frame);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  return null;
}
