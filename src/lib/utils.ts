import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export type ExportSection = {
  title: string;
  body: string;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

export function resolveFileName(
  customFileName: string,
  title: string,
  fallbackBase: string,
) {
  const normalizedCustom = customFileName.trim();

  if (normalizedCustom) {
    return stripExtension(normalizedCustom);
  }

  const normalizedTitle = slugify(title);
  return normalizedTitle || fallbackBase;
}

export function downloadTextFile(fileName: string, contents: string) {
  const blob = new Blob([contents], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function exportPdfDocument(
  fileName: string,
  title: string,
  sections: ExportSection[],
  metaLines: string[] = [],
  emptyText = "Pending content.",
) {
  const html = `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>${escapeHtml(fileName)}</title>
      <style>
        :root {
          color-scheme: light;
          --text: #111111;
          --muted: #6b7280;
          --border: #e5e7eb;
        }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          padding: 48px 56px 72px;
          color: var(--text);
          font-family: "SF Pro Display", "Helvetica Neue", Arial, sans-serif;
          line-height: 1.65;
          background: #ffffff;
        }
        header {
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border);
        }
        h1 {
          margin: 0 0 10px;
          font-size: 28px;
          line-height: 1.1;
        }
        .header-meta-stack {
          margin-top: 12px;
          display: grid;
          gap: 4px;
        }
        .meta {
          margin-bottom: 14px;
          font-family: "SF Mono", "JetBrains Mono", monospace;
          color: var(--muted);
          font-size: 12px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        section {
          break-inside: auto;
          page-break-inside: auto;
          margin-bottom: 28px;
        }
        h2 {
          margin: 0 0 14px;
          font-size: 16px;
          line-height: 1.3;
          letter-spacing: 0.01em;
          break-after: avoid;
          page-break-after: avoid;
        }
        p {
          margin: 0 0 12px;
        }
        ul, ol {
          margin: 0 0 14px;
          padding-left: 22px;
        }
        li {
          margin-bottom: 4px;
        }
        hr {
          border: 0;
          border-top: 1px solid var(--border);
          margin: 20px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 0 0 18px;
          font-size: 14px;
        }
        th, td {
          border: 1px solid var(--border);
          padding: 10px 12px;
          text-align: left;
          vertical-align: top;
        }
        th {
          background: #f8fafc;
          font-weight: 600;
        }
        .task-list {
          list-style: none;
          padding-left: 0;
        }
        .task-list li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
        .task-box {
          flex: 0 0 auto;
          width: 16px;
          height: 16px;
          margin-top: 4px;
          border: 1.5px solid #9ca3af;
          border-radius: 4px;
        }
        .task-box.checked {
          border-color: #111111;
          background: #111111;
          position: relative;
        }
        .task-box.checked::after {
          content: "";
          position: absolute;
          left: 4px;
          top: 1px;
          width: 4px;
          height: 8px;
          border: solid #ffffff;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }
        code {
          padding: 0.15em 0.35em;
          border-radius: 6px;
          background: #f3f4f6;
          font-family: "SF Mono", "JetBrains Mono", monospace;
          font-size: 0.92em;
        }
        a {
          color: inherit;
          text-decoration: underline;
        }
        .empty {
          color: var(--muted);
          font-style: italic;
        }
        @media print {
          body {
            padding: 24px 28px 40px;
          }
        }
      </style>
    </head>
    <body>
      <header>
        <div class="meta">${escapeHtml(fileName)}.pdf</div>
        <h1>${escapeHtml(title)}</h1>
        ${
          metaLines.length > 0
            ? `<div class="header-meta-stack">${metaLines
                .map((line) => `<div>${escapeHtml(line)}</div>`)
                .join("")}</div>`
            : ""
        }
      </header>
      ${sections
        .map(
          (section) => `
            <section>
              ${section.title ? `<h2>${escapeHtml(section.title)}</h2>` : ""}
              ${richTextToHtml(section.body, emptyText)}
            </section>
          `,
        )
        .join("")}
    </body>
  </html>`;

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  iframe.style.border = "0";

  const cleanup = () => {
    window.setTimeout(() => {
      iframe.remove();
    }, 400);
  };

  iframe.onload = () => {
    const frameWindow = iframe.contentWindow;

    if (!frameWindow) {
      cleanup();
      return;
    }

    frameWindow.onafterprint = cleanup;

    const printFrame = () => {
      frameWindow.focus();
      frameWindow.print();
    };

    if (frameWindow.document.fonts?.ready) {
      frameWindow.document.fonts.ready.then(() => window.setTimeout(printFrame, 80));
      return;
    }

    window.setTimeout(printFrame, 180);
  };

  document.body.appendChild(iframe);
  iframe.srcdoc = html;

  return true;
}

function richTextToHtml(text: string, emptyText = "Pending content.") {
  const trimmed = text.trim();

  if (!trimmed) {
    return emptyText ? `<p class="empty">${escapeHtml(emptyText)}</p>` : "";
  }

  const blocks = trimmed.split(/\n{2,}/);
  return blocks
    .map((block) => {
      const lines = block.split("\n").filter(Boolean);
      const isBulletList = lines.every((line) => /^[-*]\s+/.test(line.trim()));
      const isOrderedList = lines.every((line) => /^\d+\.\s+/.test(line.trim()));
      const isTaskList = lines.every((line) => /^-\s+\[(x|X| )\]\s+/.test(line.trim()));
      const isMarkdownTable =
        lines.length >= 2 &&
        lines.every((line) => /^\|.*\|$/.test(line.trim())) &&
        /^\|(?:\s*:?-{3,}:?\s*\|)+$/.test(lines[1].trim());

      if (lines.length === 1 && lines[0].trim() === "---") {
        return "<hr />";
      }

      if (lines.length === 1 && /^#{1,6}\s+/.test(lines[0].trim())) {
        const [, hashes, heading] = lines[0].trim().match(/^(#{1,6})\s+(.+)$/) ?? [];

        if (hashes && heading) {
          const level = Math.min(hashes.length + 1, 6);
          return `<h${level}>${renderInlineMarkdown(heading)}</h${level}>`;
        }
      }

      if (
        lines.length === 1 &&
        (/^\d+\.\s+\S/.test(lines[0].trim()) ||
          /^PHASE\s+\d+\s+—\s+/.test(lines[0].trim()) ||
          lines[0].trim() === "PIPELINE RULES" ||
          lines[0].trim() === "MINIMUM SUCCESS STATE")
      ) {
        return `<h2>${renderInlineMarkdown(lines[0].trim())}</h2>`;
      }

      if (isMarkdownTable) {
        const headers = splitMarkdownTableRow(lines[0]);
        const rows = lines.slice(2).map(splitMarkdownTableRow);

        return `<table><thead><tr>${headers
          .map((cell) => `<th>${renderInlineMarkdown(cell)}</th>`)
          .join("")}</tr></thead><tbody>${rows
          .map(
            (row) =>
              `<tr>${row
                .map((cell) => `<td>${renderInlineMarkdown(cell)}</td>`)
                .join("")}</tr>`,
          )
          .join("")}</tbody></table>`;
      }

      if (isTaskList) {
        return `<ul class="task-list">${lines
          .map((line) => {
            const match = line.trim().match(/^-\s+\[(x|X| )\]\s+(.+)$/);
            const checked = match?.[1]?.toLowerCase() === "x";
            const text = match?.[2] ?? line.trim();
            return `<li><span class="task-box${checked ? " checked" : ""}"></span><span>${renderInlineMarkdown(text)}</span></li>`;
          })
          .join("")}</ul>`;
      }

      if (isBulletList) {
        return `<ul>${lines
          .map((line) => `<li>${renderInlineMarkdown(line.replace(/^[-*]\s+/, ""))}</li>`)
          .join("")}</ul>`;
      }

      if (isOrderedList) {
        return `<ol>${lines
          .map((line) => `<li>${renderInlineMarkdown(line.replace(/^\d+\.\s+/, ""))}</li>`)
          .join("")}</ol>`;
      }

      return `<p>${lines.map(renderInlineMarkdown).join("<br />")}</p>`;
    })
    .join("");
}

function splitMarkdownTableRow(row: string) {
  return row
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function renderInlineMarkdown(text: string) {
  const tokens: string[] = [];
  let output = escapeHtml(text);

  output = output.replace(/`([^`]+)`/g, (_, code) => {
    const token = `__TOKEN_${tokens.length}__`;
    tokens.push(`<code>${escapeHtml(code)}</code>`);
    return token;
  });

  output = output.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
    const token = `__TOKEN_${tokens.length}__`;
    tokens.push(`<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`);
    return token;
  });

  output = output.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  output = output.replace(/(^|[\s(])\*([^*]+)\*(?=[\s).,;:]|$)/g, "$1<em>$2</em>");

  tokens.forEach((tokenHtml, index) => {
    output = output.replace(`__TOKEN_${index}__`, tokenHtml);
  });

  return output;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function stripExtension(value: string) {
  return value.replace(/\.[a-z0-9]+$/i, "");
}
