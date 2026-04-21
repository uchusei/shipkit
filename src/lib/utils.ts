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
        .meta {
          font-family: "SF Mono", "JetBrains Mono", monospace;
          color: var(--muted);
          font-size: 12px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        section {
          break-inside: avoid;
          margin-bottom: 28px;
        }
        h2 {
          margin: 0 0 14px;
          font-size: 16px;
          line-height: 1.3;
          letter-spacing: 0.01em;
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
      </header>
      ${sections
        .map(
          (section) => `
            <section>
              <h2>${escapeHtml(section.title)}</h2>
              ${richTextToHtml(section.body)}
            </section>
          `,
        )
        .join("")}
      <script>
        window.onload = () => {
          window.print();
        };
      </script>
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
    window.setTimeout(() => {
      frameWindow.focus();
      frameWindow.print();
    }, 180);
  };

  document.body.appendChild(iframe);
  iframe.srcdoc = html;

  return true;
}

function richTextToHtml(text: string) {
  const trimmed = text.trim();

  if (!trimmed) {
    return '<p class="empty">Pending content.</p>';
  }

  const blocks = trimmed.split(/\n{2,}/);
  return blocks
    .map((block) => {
      const lines = block.split("\n").filter(Boolean);
      const isBulletList = lines.every((line) => /^[-*]\s+/.test(line.trim()));
      const isOrderedList = lines.every((line) => /^\d+\.\s+/.test(line.trim()));

      if (isBulletList) {
        return `<ul>${lines
          .map((line) => `<li>${escapeHtml(line.replace(/^[-*]\s+/, ""))}</li>`)
          .join("")}</ul>`;
      }

      if (isOrderedList) {
        return `<ol>${lines
          .map((line) => `<li>${escapeHtml(line.replace(/^\d+\.\s+/, ""))}</li>`)
          .join("")}</ol>`;
      }

      return `<p>${lines.map(escapeHtml).join("<br />")}</p>`;
    })
    .join("");
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
