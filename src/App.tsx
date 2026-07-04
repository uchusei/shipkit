import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  ClipboardCheck,
  Columns2,
  Copy,
  Download,
  FileDown,
  FilePenLine,
  FolderKanban,
  Lock,
  LockOpen,
  Maximize2,
  Minimize2,
  MonitorCog,
  PanelLeftClose,
  PanelLeftOpen,
  Pin,
  PinOff,
  Plus,
  RefreshCcw,
  Rows3,
  MoonStar,
  SunMedium,
  Type,
  X,
} from "lucide-react";
import {
  NavLink,
  Navigate,
  Route,
  Routes,
  useParams,
} from "react-router-dom";
import { Button, Checkbox, Field, Input, Panel, StatusPill, Textarea } from "@/components/ui";
import {
  README_DEFAULT_DOCUMENT,
  codeReviewSections,
  courseDocuments,
  frameworkDocuments,
  type CourseDocument,
  templates,
  type FrameworkDocument,
  type TemplateDefinition,
} from "@/data/documents";
import {
  VIBE_CODING_BUILD_LOOP_GUIDANCE,
  VIBE_CODING_PROJECT_SKELETON_GUIDANCE,
  VIBE_CODING_CODEX_KICKOFF_PROMPT,
  VIBE_CODING_DEPLOYMENT_GUIDANCE,
  VIBE_CODING_WORKFLOW_GUIDANCE,
  vibeCodingSteps,
  type VibeCodingStepDefinition,
} from "@/data/vibe-coding";
import {
  downloadTextFile,
  exportPdfDocument,
  slugify,
  type ExportSection,
} from "@/lib/utils";

type TemplateDraftSection = {
  id: string;
  baseTitle: string;
  title: string;
  baseHelpText: string;
  helpText: string;
  baseContent: string;
  content: string;
};

type TemplateDraft = {
  title: string;
  owner: string;
  created: string;
  lastUpdated: string;
  fileName: string;
  baseDocumentContent?: string;
  documentContent?: string;
  sections: TemplateDraftSection[];
  updatedAt: string;
};

type CodeReviewSectionDraft = {
  id: string;
  baseTitle: string;
  title: string;
  checklist: string;
  findings: string;
  checked: boolean;
};

type CodeReviewDraft = {
  title: string;
  owner: string;
  lastChecked: string;
  fileName: string;
  reviewScopePrompt: string;
  sections: CodeReviewSectionDraft[];
  updatedAt: string;
};

type HelpDocSectionDraft = {
  id: string;
  title: string;
  baseContent: string;
  content: string;
};

type HelpDocDraft = {
  title: string;
  fileName: string;
  baseContent: string;
  content: string;
  updatedAt: string;
};

type LibraryDocument = FrameworkDocument | CourseDocument;

type VibeCodingStepDraft = {
  id: string;
  baseTitle: string;
  title: string;
  tool: "ChatGPT" | "Codex";
  goal: string;
  requiredInputs: string[];
  howToUse: string[];
  artifactLabel: string;
  artifactPrefix: string;
  artifactTemplate: string;
  artifactUsedFor: string;
  outputPlaceholder: string;
  basePrompt: string;
  prompt: string;
  notes: string;
  completed: boolean;
};

type VibeCodingDraft = {
  title: string;
  owner: string;
  created: string;
  lastUpdated: string;
  kickoffPrompt: string;
  executionNotes: string;
  steps: VibeCodingStepDraft[];
  updatedAt: string;
};

type FloatingPanelState = {
  mode: "docked" | "floating";
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
  expanded: boolean;
  locked: boolean;
};

type FloatingPanelMap = Record<string, FloatingPanelState>;
type ThemePreference = "system" | "light" | "dark";
type EditorLayoutMode = "single" | "split";
type EditorFontScale = "sm" | "md" | "lg";
type TemplateFilter = "all" | "development" | "pipeline";

const DEV_PROJECT_STEP_ONE_ADAPT_PROMPT = `Which sections should we keep?
Which sections should be added?
Which bullet points (IN MUST HAVE) within a section must be added?
Which sections do we not need?
Which bullet points (IN MUST HAVE) within a section should be removed?`;

const DEV_PROJECT_SECTION_FILL_PROMPT = `Now we are structuring the Dev Project Master Document for
this project.

We will fill and formulate ONE section at a time.
Now fill and formulate this section:

[INPUT SECTION HERE]

Context:
[PASTE RELEVANT DECISIONS HERE OR WRITE "NONE"]

(this one is used to inform the AI about other sections
already done, context, decisions, constraints or other
important information to note)

Instructions:
- Be strict, concrete, and minimal
- Only include what can be directly inferred or has been
decided
- Do NOT expand scope beyond what is implied and what we
have discussed
- Prefer bullet points over paragraphs
Requirements:
- Fill and answer all items under "Must include"
- If something is not applicable -> write "N/A"
- If something important is missing for the section -> add
this and mark it as "ADDED" with a short description on why
you added it

Constraints:
- No fluff
- No generic statements
- No duplication
- No hidden assumptions
- No invented features, flows, or systems
Consistency:
- Ensure internal consistency within this section
- Do NOT contradict provided context
- If something is unclear -> mark it as "OPEN" instead of
guessing or discussing
Output:
Return ONLY the filled section
Do NOT:
- invent scope
- introduce new features
- make product decisions not already implied
Be opinionated only when choosing between obvious
alternatives within the given constraints.`;

const DEV_PROJECT_SYNC_PASS_PROMPT = `Review the full document for:
- contradictions
- duplicated logic
- missing dependencies
- inconsistencies between product, tech, and domain
- missing sections
- missing bulletpoint/bulletpoints in a section
- something else? think about everything

List issues only. Do not rewrite.`;

const CODE_REVIEW_SCOPE_PROMPT_DEFAULT = `Review the code in [file, folder, or diff].

For [Add your input here, example category "Correctness and bugs" and what to review]

• Review [entire file / entire folder / changed lines only / PR diff]
• Use surrounding code context where needed to understand behavior, dependencies, regressions, and integration risk
• Infer the language, framework, runtime, architecture style, and patterns from the code unless explicitly provided
• If context is missing, state what cannot be fully verified
• Review both the changed code and the nearby code paths it can affect
• Distinguish between issues introduced by the current change and pre-existing issues merely exposed by it

Instructions:
• Report only concrete, actionable issues supported by the code
• Keep findings implementation-specific and grounded in actual code behavior
• Do not invent behavior, intent, dependencies, or line numbers
• Do not duplicate the same issue across categories or findings
• Prefer reporting the root cause rather than downstream symptoms
• Distinguish clearly between:
– Confirmed issue
– Needs verification
– Pre-existing issue exposed by current change
• Mark uncertain findings explicitly as: Needs verification
• Consider both local defects and system-level / regression risks where visible
• Prioritize exploitable, user-impacting, and high-confidence issues
• Do not report purely hypothetical issues unless the code provides a concrete reason to suspect them
• Do not report trivial style issues unless they materially affect correctness, security, performance, accessibility, maintainability, operability, or compliance
• If exact line numbers are not visible, use the narrowest accurate line range possible
• Call out missing dependencies required for confident review when relevant (e.g. config, env, schema, tests, infra, contracts, migrations, feature flags, deployment order, API contracts, schema expectations, serialization/deserialization boundaries, backward compatibility where relevant)
• Call out where the change lacks tests for the risky behavior, but only when the missing test leaves important behavior unverified
• Recommended fixes should be specific and proportionate to the issue.
• Do not propose large rewrites unless the issue truly requires it.

Prioritization:
• Prioritize findings by severity: Critical, High, Medium, Low
• Start with Critical findings, then High, then Medium, then Low
• Within each severity, order findings by user impact and confidence

Completion:
• If no significant issues are found, state this explicitly. Do not manufacture findings to satisfy the review request.
• End with:
– Overall risk summary
– Main problem patterns found
– What could not be fully verified due to missing context

Severity definitions:
• Critical = exploitable security issue, data loss/corruption, auth bypass, production outage risk
• High = likely user-facing breakage, major regression risk, unsafe behavior
• Medium = correctness/maintainability/operability issue with realistic impact
• Low = minor but real issue worth fixing


Output:

Review summary:
– Overall risk summary:
– Main problem patterns found:
– What could not be fully verified due to missing context:
– Reviewed file / folder / diff / changed lines:
– Total findings by severity:
– Final recommendation:

For each finding:
– Severity:
– Confidence:
– Change origin:
– File:Line(s):
– Issue:
– Why it matters:
– Impact:
– Recommended fix:
– Evidence / code reference:
– Notes: (Optional: missing context, caveats, follow-up checks, or constraints)
– Verification status: (Confirmed issue / Needs verification / Pre-existing issue exposed by current change)`;

function App() {
  const [templateDrafts, setTemplateDrafts] = usePersistentState<Record<string, TemplateDraft>>(
    "shipkit-template-drafts-v1",
    {},
  );
  const [codeReviewDraft, setCodeReviewDraft] = usePersistentState<CodeReviewDraft>(
    "shipkit-code-review-draft-v1",
    createCodeReviewDraft(),
  );
  const [helpDocDrafts, setHelpDocDrafts] = usePersistentState<Record<string, HelpDocDraft>>(
    "shipkit-help-doc-drafts-v1",
    {},
  );
  const [courseDrafts, setCourseDrafts] = usePersistentState<Record<string, HelpDocDraft>>(
    "shipkit-course-drafts-v1",
    {},
  );
  const [vibeCodingDraft, setVibeCodingDraft] = usePersistentState<VibeCodingDraft>(
    "shipkit-vibe-coding-draft-v1",
    createVibeCodingDraft(),
  );
  const [themePreference, setThemePreference] = usePersistentState<ThemePreference>(
    "shipkit-theme-preference-v1",
    "system",
  );
  const [sidebarCollapsed, setSidebarCollapsed] = usePersistentState<boolean>(
    "shipkit-sidebar-collapsed-v1",
    false,
  );
  const [templateLayoutMode, setTemplateLayoutMode] = usePersistentState<EditorLayoutMode>(
    "shipkit-template-layout-v1",
    "single",
  );
  const [reviewLayoutMode, setReviewLayoutMode] = usePersistentState<EditorLayoutMode>(
    "shipkit-review-layout-v1",
    "single",
  );
  const [editorFontScale, setEditorFontScale] = usePersistentState<EditorFontScale>(
    "shipkit-editor-font-scale-v1",
    "md",
  );
  const systemTheme = useSystemTheme();
  const resolvedTheme = themePreference === "system" ? systemTheme : themePreference;

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
  }, [resolvedTheme]);

  return (
    <div
      className={[
        "app-grid bg-background text-foreground",
        sidebarCollapsed ? "sidebar-collapsed" : "",
      ].join(" ")}
    >
      {!sidebarCollapsed ? (
        <Sidebar
          themePreference={themePreference}
          onThemeChange={setThemePreference}
          onCollapse={() => setSidebarCollapsed(true)}
        />
      ) : null}
      <main className="main-shell">
        {sidebarCollapsed ? (
          <button
            type="button"
            className="sidebar-reveal"
            onClick={() => setSidebarCollapsed(false)}
            aria-label="Open sidebar"
          >
            <PanelLeftOpen className="size-4" />
            <span>Menu</span>
          </button>
        ) : null}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/templates"
            element={<TemplateLibrary templateDrafts={templateDrafts} />}
          />
          <Route
            path="/templates/:templateSlug"
            element={
              <TemplateEditor
                templateDrafts={templateDrafts}
                onChange={setTemplateDrafts}
                layoutMode={templateLayoutMode}
                onLayoutModeChange={setTemplateLayoutMode}
                fontScale={editorFontScale}
                onFontScaleChange={setEditorFontScale}
              />
            }
          />
          <Route
            path="/vibe-coding"
            element={
              <VibeCodingPage
                draft={vibeCodingDraft}
                onChange={setVibeCodingDraft}
                fontScale={editorFontScale}
                onFontScaleChange={setEditorFontScale}
              />
            }
          />
          <Route
            path="/code-review"
            element={
              <CodeReviewPage
                draft={codeReviewDraft}
                onChange={setCodeReviewDraft}
                layoutMode={reviewLayoutMode}
                onLayoutModeChange={setReviewLayoutMode}
                fontScale={editorFontScale}
                onFontScaleChange={setEditorFontScale}
              />
            }
          />
          <Route
            path="/frameworks"
            element={<HelpDocsLibrary helpDocDrafts={helpDocDrafts} onChange={setHelpDocDrafts} />}
          />
          <Route path="/frameworks/:docSlug" element={<Navigate to="/frameworks" replace />} />
          <Route
            path="/courses"
            element={<CoursesLibrary courseDrafts={courseDrafts} onChange={setCourseDrafts} />}
          />
          <Route path="/courses/:docSlug" element={<Navigate to="/courses" replace />} />
          <Route path="/help" element={<Navigate to="/frameworks" replace />} />
          <Route path="/help/:docSlug" element={<Navigate to="/frameworks" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function Sidebar({
  themePreference,
  onThemeChange,
  onCollapse,
}: {
  themePreference: ThemePreference;
  onThemeChange: React.Dispatch<React.SetStateAction<ThemePreference>>;
  onCollapse: () => void;
}) {
  return (
    <aside className="sidebar-shell sticky top-0 border-r border-border px-5 py-6">
      <div className="space-y-5">
        <div className="surface p-5">
          <div className="flex items-center justify-between gap-3">
            <NavLink to="/" className="flex min-w-0 items-center gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/8 bg-[#212121] text-lg font-medium text-accent shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
                S
              </div>
              <div className="min-w-0">
                <h1 className="text-[1.7rem] leading-none font-semibold tracking-[0.01em] text-gradient">
                  Shipkit
                </h1>
              </div>
            </NavLink>
            <Button variant="ghost" size="sm" onClick={onCollapse}>
              <PanelLeftClose className="size-4" />
            </Button>
          </div>
          <p className="mt-4 max-w-sm text-[0.98rem] leading-7 text-muted-foreground">
            Emma’s Shipkit — build, learn, and ship.
          </p>
        </div>

        <div className="surface-subtle p-2.5">
          <nav className="space-y-1.5">
            <SidebarLink
              to="/templates"
              icon={<FolderKanban className="size-4" />}
              title="Templates"
              description="My templates for product and development work."
            />
            <SidebarLink
              to="/vibe-coding"
              icon={<FilePenLine className="size-4" />}
              title="Vibe Coding"
              description="Guided ChatGPT to Codex workflow for shipping an MVP."
            />
            <SidebarLink
              to="/code-review"
              icon={<ClipboardCheck className="size-4" />}
              title="Code Review"
              description="Code Review Checklist."
            />
            <SidebarLink
              to="/frameworks"
              icon={<BookOpen className="size-4" />}
              title="Frameworks"
              description="Product pressure-testing frameworks."
            />
            <SidebarLink
              to="/courses"
              icon={<BookOpen className="size-4" />}
              title="Courses"
              description="Interactive AI course prompt templates."
            />
          </nav>
        </div>

        <div className="surface-subtle p-4">
          <div className="mono-label">Theme</div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              {
                value: "system" as const,
                label: "System",
                icon: <MonitorCog className="size-[1.1rem] shrink-0 stroke-[2.15]" />,
              },
              {
                value: "light" as const,
                label: "Light",
                icon: <SunMedium className="size-4.5 shrink-0" />,
              },
              {
                value: "dark" as const,
                label: "Dark",
                icon: <MoonStar className="size-4.5 shrink-0" />,
              },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onThemeChange(option.value)}
                className={[
                  "flex items-center justify-center gap-1.5 rounded-2xl border px-3 py-2.5 text-xs font-medium transition-colors",
                  themePreference === option.value
                    ? "border-border-strong bg-[color:var(--chrome-strong)] text-foreground"
                    : "border-[color:var(--chrome-soft)] bg-[color:var(--chrome-soft)] text-muted-foreground hover:bg-[color:var(--chrome-hover)] hover:text-foreground",
                ].join(" ")}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-8 text-center text-xs text-muted-foreground">

   <p>
    Version:{" "}
    <a
      href="https://github.com/uchusei/shipkit"
      target="_blank"
      rel="noreferrer"
      className="underline hover:text-foreground"
    >
      v0.1.6
    </a>
  </p>

  <p>
    Built by{" "}
    <a
      href="https://github.com/uchusei"
      target="_blank"
      rel="noreferrer"
      className="underline hover:text-foreground"
    >
      uchusei
    </a>{" "}
    /{" "}
    <a
      href="https://wowen.se"
      target="_blank"
      rel="noreferrer"
      className="underline hover:text-foreground"
    >
      WOWEN
    </a>
  </p>

 <p className="mt-3">
    Vibe Coding prompts based on:{" "}
    <a
      href="https://github.com/KhazP/vibe-coding-prompt-template/tree/main"
      target="_blank"
      rel="noreferrer"
      className="block underline hover:text-foreground"
    >
      KhazP/vibe-coding-prompt-template
    </a>
  </p>
</div>
    </aside>
  );
}

function HomePage() {
  const productAreas = [
    {
      title: "Templates",
      description: "Open structured project documents, edit them in-app, and export them as Markdown or PDF.",
      to: "/templates",
      eyebrow: "Workspace",
    },
    {
      title: "Vibe Coding",
      description: "Go from research to PRD, tech design, Codex setup, and step-by-step execution.",
      to: "/vibe-coding",
      eyebrow: "Workflow",
    },
    {
      title: "Code Review",
      description: "Run broad review checklists, capture findings, and export a real review document.",
      to: "/code-review",
      eyebrow: "Review",
    },
    {
      title: "Frameworks",
      description: "Use reusable product and AI critique frameworks as editable working documents.",
      to: "/frameworks",
      eyebrow: "Reference",
    },
    {
      title: "Courses",
      description: "Open interactive AI course prompts for product, frontend, and cybersecurity learning.",
      to: "/courses",
      eyebrow: "Learning",
    },
  ];

  return (
    <div className="page-frame mx-auto flex max-w-[1450px] flex-col gap-6 px-4 py-6 md:px-6">
      <div className="hero-surface p-6 md:p-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] xl:items-end">
          <div className="space-y-4">
            <div className="mono-label">Shipkit</div>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-[0.01em] text-balance text-gradient md:text-6xl">
              One workspace for structured product work.
            </h1>
            <p className="max-w-3xl text-base leading-8 text-foreground-soft md:text-lg">
              Shipkit is a clean document tool I built for adapting product templates, running code reviews,
              keeping reusable frameworks, and moving from idea to MVP with a guided workflow.
            </p>
          </div>

          <div className="surface-subtle px-5 py-5">
            <div className="mono-label">Quick start</div>
            <div className="mt-4 grid gap-3">
              <LandingActionLink to="/templates" label="Open Templates" />
              <LandingActionLink to="/vibe-coding" label="Open Vibe Coding" />
              <LandingActionLink to="/code-review" label="Open Code Review" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {productAreas.map((area, index) => (
          <Panel
            key={area.to}
            className="stagger-enter"
            style={{ ["--enter-delay" as string]: `${0.05 * index + 0.04}s` }}
          >
            <div className="space-y-5">
              <div className="space-y-2">
                <StatusPill tone="default">{area.eyebrow}</StatusPill>
                <h2 className="text-2xl font-semibold tracking-[0.005em]">{area.title}</h2>
              </div>
              <p className="max-w-[42ch] text-sm leading-7 text-foreground-soft">
                {area.description}
              </p>
              <div className="pt-1">
                <LandingActionLink to={area.to} label={`Open ${area.title}`} />
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function LandingActionLink({
  to,
  label,
}: {
  to: string;
  label: string;
}) {
  return (
    <NavLink
      to={to}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[color:var(--chrome-focus)] bg-accent px-4 py-2.5 text-sm font-medium tracking-[0.01em] text-[color:var(--accent-contrast)] shadow-[0_12px_28px_color-mix(in_srgb,var(--accent)_28%,transparent)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105"
    >
      <ArrowUpRight className="size-4" />
      {label}
    </NavLink>
  );
}

function SidebarLink({
  to,
  icon,
  title,
  description,
}: {
  to: string;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "group flex items-start gap-3 rounded-[18px] border px-3.5 py-3 transition-all duration-200",
          isActive
            ? "border-border-strong bg-[color:var(--chrome-hover)] shadow-[inset_0_1px_0_var(--chrome-soft)]"
            : "border-transparent hover:bg-[color:var(--chrome-soft)]",
        ].join(" ")
      }
    >
      <div className="mt-0.5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium text-foreground">{title}</div>
        <div className="mt-1 text-xs leading-5 text-muted-foreground">{description}</div>
      </div>
    </NavLink>
  );
}

function TemplateLibrary({
  templateDrafts,
}: {
  templateDrafts: Record<string, TemplateDraft>;
}) {
  const [filter, setFilter] = useState<TemplateFilter>("all");
  const filteredTemplates = templates.filter((template) => {
    if (filter === "all") {
      return true;
    }

    return getTemplateLens(template) === filter;
  });

  return (
    <div className="page-frame mx-auto flex max-w-[1450px] flex-col gap-6 px-4 py-6 md:px-6">
      <PageIntro
        eyebrow="Templates"
        title="Project Templates"
        description="Open the right working document, shape it in the app, and export a clean final Markdown or PDF artifact."
      />

      <div className="surface-subtle flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mono-label">Filter</div>
          <p className="mt-2 text-sm leading-6 text-foreground-soft">
            Narrow the library to the kind of working document you need.
          </p>
        </div>
        <div className="w-full max-w-[560px]">
          <ControlGroup
            label="Visible templates"
            options={[
              { value: "all", label: "All" },
              { value: "development", label: "Development" },
              { value: "pipeline", label: "Pipeline" },
            ]}
            value={filter}
            onChange={(value) => setFilter(value as TemplateFilter)}
          />
        </div>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-3">
        {filteredTemplates.map((template, index) => {
          const draft = templateDrafts[template.slug];
          const customizedCount = draft
            ? countCustomizedTemplateDraft(template, normalizeTemplateDraft(template, draft))
            : 0;

          return (
            <Panel
              key={template.id}
              className="stagger-enter self-start"
              style={{ ["--enter-delay" as string]: `${0.05 * index + 0.04}s` }}
            >
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <StatusPill tone="default">{getTemplateLensLabel(template)}</StatusPill>
                    <h2 className="text-xl font-semibold tracking-[0.005em]">
                      {template.name}
                    </h2>
                  </div>
                  {customizedCount > 0 ? (
                    <StatusPill tone="success">{customizedCount} edits</StatusPill>
                  ) : null}
                </div>

                <p className="max-w-[32ch] text-sm leading-6 text-foreground-soft">
                  {template.description}
                </p>

                <NavLink to={`/templates/${template.slug}`} className="block pt-1">
                  <Button variant="primary" className="w-full">
                    <FilePenLine data-icon="inline-start" className="size-4" />
                    Open template
                  </Button>
                </NavLink>
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}

function TemplateEditor({
  templateDrafts,
  onChange,
  layoutMode,
  onLayoutModeChange,
  fontScale,
  onFontScaleChange,
}: {
  templateDrafts: Record<string, TemplateDraft>;
  onChange: React.Dispatch<React.SetStateAction<Record<string, TemplateDraft>>>;
  layoutMode: EditorLayoutMode;
  onLayoutModeChange: React.Dispatch<React.SetStateAction<EditorLayoutMode>>;
  fontScale: EditorFontScale;
  onFontScaleChange: React.Dispatch<React.SetStateAction<EditorFontScale>>;
}) {
  const { templateSlug } = useParams();
  const template = templates.find((item) => item.slug === templateSlug);

  if (!template) {
    return <EmptyState title="Template not found" description="Choose one of the available templates from the sidebar or template library." />;
  }

  const activeTemplate = template;
  const draft = normalizeTemplateDraft(
    activeTemplate,
    templateDrafts[activeTemplate.slug] ?? createTemplateDraft(activeTemplate),
  );
  const latestTemplateDraftRef = useRef(draft);
  const isSingleDocumentTemplate = isSingleDocumentTemplateSlug(activeTemplate.slug);

  useEffect(() => {
    latestTemplateDraftRef.current = draft;
  }, [draft]);

  function updateDraft(updater: (current: TemplateDraft) => TemplateDraft) {
    onChange((current) => {
      const base = normalizeTemplateDraft(
        activeTemplate,
        current[activeTemplate.slug] ?? createTemplateDraft(activeTemplate),
      );
      const next = updater(base);
      latestTemplateDraftRef.current = next;
      return {
        ...current,
        [activeTemplate.slug]: {
          ...next,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  }

  if (isSingleDocumentTemplate) {
    const resolvedTitle = draft.title.trim() || activeTemplate.name;
    const templateMetaLines = createTemplateMetaLines(activeTemplate, draft);
    const singleDocumentContent = getSingleDocumentContent(activeTemplate, draft);
    const singleDocumentSections = getTemplateExportSections(activeTemplate, draft);
    const resolvedFileName = buildTemplateFileName(activeTemplate, draft.title);

    function handlePipelineExportMarkdown() {
      const currentDraft = latestTemplateDraftRef.current;
      const currentTitle = currentDraft.title.trim() || activeTemplate.name;
      const currentMetaLines = createTemplateMetaLines(activeTemplate, currentDraft);
      const currentFileName = buildTemplateFileName(activeTemplate, currentDraft.title);
      const markdown = getTemplateExportMarkdown(activeTemplate, currentDraft, currentTitle, currentMetaLines);
      downloadTextFile(`${currentFileName}.md`, markdown);
    }

    function handlePipelineExportPdf() {
      const currentDraft = latestTemplateDraftRef.current;
      const currentTitle = currentDraft.title.trim() || activeTemplate.name;
      const currentMetaLines = createTemplateMetaLines(activeTemplate, currentDraft);
      const currentFileName = buildTemplateFileName(activeTemplate, currentDraft.title);
      exportPdfDocument(
        currentFileName,
        currentTitle,
        getTemplateExportSections(activeTemplate, currentDraft),
        currentMetaLines,
        "",
      );
    }

    return (
      <div className="page-frame mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-6 md:px-6">
        <PageHeader
          eyebrow="Template editor"
          title={activeTemplate.name}
          description={activeTemplate.description}
          actions={
            <>
              <Button variant="secondary" onClick={handlePipelineExportMarkdown}>
                <Download className="size-4" />
                Export Markdown
              </Button>
              <Button variant="primary" onClick={handlePipelineExportPdf}>
                <FileDown className="size-4" />
                Export PDF
              </Button>
            </>
          }
        />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Panel className="stagger-enter">
            <div className="space-y-4">
              <Field label="Headline">
                <Input
                  value={draft.title}
                  onChange={(event) =>
                    updateDraft((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder={activeTemplate.name}
                />
              </Field>
              <Field label="Document">
                <Textarea
                  value={singleDocumentContent}
                  onChange={(event) =>
                    updateDraft((current) => ({
                      ...current,
                      documentContent: event.target.value,
                    }))
                  }
                  className={getEditorTextAreaClass(fontScale)}
                  rows={34}
                />
              </Field>
            </div>
          </Panel>

          <div className="sticky-stack-scroll space-y-4">
            <Panel>
              <div className="space-y-4">
                <div>
                  <div className="mono-label">Document settings</div>
                  <h2 className="mt-2 text-lg font-semibold tracking-[0.005em]">
                    File name and export
                  </h2>
                </div>

                <Field
                  label="Project name"
                  hint="Used as the document title in live preview and exported documents."
                >
                  <Input
                    placeholder={getTemplateDefaultProjectPrefix(activeTemplate)}
                    value={draft.title}
                    onChange={(event) =>
                      updateDraft((current) => ({ ...current, title: event.target.value }))
                    }
                  />
                </Field>

                {activeTemplate.slug !== "readme-md" ? (
                  <Field
                    label="Document"
                    hint="Fixed document label used in live preview and exported documents."
                  >
                    <Input value={activeTemplate.name} readOnly />
                  </Field>
                ) : null}

                <Field label="Owner" hint="Shown in live preview and exported documents.">
                  <Input
                    placeholder="Owner"
                    value={draft.owner}
                    onChange={(event) =>
                      updateDraft((current) => ({ ...current, owner: event.target.value }))
                    }
                  />
                </Field>

                <Field
                  label="Created"
                  hint="Use YYYY-MM-DD format, for example 2026-04-23."
                >
                  <Input
                    type="date"
                    value={draft.created}
                    onChange={(event) =>
                      updateDraft((current) => ({ ...current, created: event.target.value }))
                    }
                  />
                </Field>

                <Field
                  label="Last updated"
                  hint="Use YYYY-MM-DD format, for example 2026-04-23."
                >
                  <Input
                    type="date"
                    value={draft.lastUpdated}
                    onChange={(event) =>
                      updateDraft((current) => ({ ...current, lastUpdated: event.target.value }))
                    }
                  />
                </Field>

                <Field
                  label="File name"
                  hint={`Generated automatically as ${resolvedFileName}.md / ${resolvedFileName}.pdf`}
                >
                  <Input value={resolvedFileName} readOnly />
                </Field>

                <div className="grid gap-2">
                  <Button variant="primary" onClick={handlePipelineExportPdf}>
                    <FileDown className="size-4" />
                    Save PDF
                  </Button>
                  <Button variant="secondary" onClick={handlePipelineExportMarkdown}>
                    <Download className="size-4" />
                    Save Markdown
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => updateDraft(() => createTemplateDraft(activeTemplate))}
                  >
                    <RefreshCcw className="size-4" />
                    Reset draft
                  </Button>
                </div>
              </div>
            </Panel>

            <Panel>
              <DockedPanelHeader
                title="Live Preview"
                subtitle={resolvedFileName}
              />
              <div className="mt-4">
                <DocumentPreview
                  title={resolvedTitle}
                  metaLines={templateMetaLines}
                  sections={singleDocumentSections}
                  fontScale={fontScale}
                  emptyText=""
                />
              </div>
            </Panel>
          </div>
        </div>
      </div>
    );
  }

  const panelIds = useMemo(
    () => [
      "template-sections",
      "template-document",
      "template-preview",
      ...draft.sections.map((section) => `template-section-${section.id}`),
    ],
    [draft.sections],
  );
  const {
    panels,
    isFloating,
    floatPanel,
    dockPanel,
    toggleLock,
    toggleExpanded,
    startDrag,
    startResize,
  } = usePanelWorkspace(panelIds);
  const isDevProjectTemplate = activeTemplate.slug === "dev-project-master-document";
  const resolvedTitle = draft.title.trim() || activeTemplate.name;
  const templateMetaLines = createTemplateMetaLines(activeTemplate, draft);
  const resolvedFileName = buildTemplateFileName(activeTemplate, draft.title);
  const templatePreviewSections = getTemplateExportSections(activeTemplate, draft);

  function handleExportMarkdown() {
    const currentDraft = latestTemplateDraftRef.current;
    const currentTitle = currentDraft.title.trim() || activeTemplate.name;
    const currentMetaLines = createTemplateMetaLines(activeTemplate, currentDraft);
    const currentFileName = buildTemplateFileName(activeTemplate, currentDraft.title);
    const markdown = getTemplateExportMarkdown(activeTemplate, currentDraft, currentTitle, currentMetaLines);
    downloadTextFile(`${currentFileName}.md`, markdown);
  }

  function handleExportPdf() {
    const currentDraft = latestTemplateDraftRef.current;
    const currentTitle = currentDraft.title.trim() || activeTemplate.name;
    const currentMetaLines = createTemplateMetaLines(activeTemplate, currentDraft);
    const currentFileName = buildTemplateFileName(activeTemplate, currentDraft.title);
    exportPdfDocument(
      currentFileName,
      currentTitle,
      getTemplateExportSections(activeTemplate, currentDraft),
      currentMetaLines,
      "",
    );
  }

  function handleJumpToSection(sectionId: string) {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function addTemplateSection() {
    updateDraft((current) => ({
      ...current,
      sections: [
        ...current.sections,
        {
          id: createDraftSectionId("template-section"),
          baseTitle: `New section ${current.sections.length + 1}`,
          title: `New section ${current.sections.length + 1}`,
          baseHelpText: "",
          helpText: "Use this section for project-specific content that does not fit the base template.",
          baseContent: "",
          content: "",
        },
      ],
    }));
  }

  function deleteTemplateSection(sectionId: string) {
    updateDraft((current) => ({
      ...current,
      sections: current.sections.filter((section) => section.id !== sectionId),
    }));
  }

  function updateTemplateSectionTitle(sectionId: string, title: string) {
    updateDraft((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.id === sectionId ? { ...section, title } : section,
      ),
    }));
  }

  const dockedSections = draft.sections.filter(
    (section) => !isFloating(`template-section-${section.id}`),
  );
  const syncPassContent = isDevProjectTemplate ? (
    <div className="space-y-4">
      <div>
        <h3 className="mt-2 text-lg font-semibold tracking-[0.005em]">Sync Pass</h3>
      </div>
      <div className="surface-subtle px-4 py-4 text-sm leading-7 text-foreground-soft">
        When all sections are done its time to review it and sync pass it.
      </div>
      <CopyPromptField
        label="Review prompt"
        buttonLabel="Copy prompt"
        prompt={DEV_PROJECT_SYNC_PASS_PROMPT}
      />
      <div className="surface-subtle px-4 py-4 text-sm leading-7 text-foreground-soft">
        When it is fully complete: use it as your foundation while executing the project - it
        becomes your GOVERNING DOCUMENT for the entire project. Next steps: Does the project need
        a pipeline, roadmap, requirements spec or anything else?
      </div>
    </div>
  ) : null;
  const templateDocumentContent = (
    <div className="space-y-8">
      {draft.sections.map((section, index) => {
        const status = getTemplateSectionStatus(section);

        return (
          <section key={section.id} id={section.id} className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="mono-label">Section {index + 1}</div>
                <h3 className="mt-2 text-lg font-semibold tracking-[0.005em]">
                  {section.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {status.label ? <StatusPill tone={status.tone}>{status.label}</StatusPill> : null}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => floatPanel(`template-section-${section.id}`)}
                >
                  <PinOff className="size-3.5" />
                  Float
                </Button>
              </div>
            </div>
            {renderTemplateSectionEditor({
              draftSection: section,
              sectionIndex: index,
              fontScale,
              displayMode: "inline",
              onTitleChange: (title) =>
                updateTemplateSectionTitle(section.id, title),
              onHelpTextChange: (helpText) =>
                updateDraft((current) => ({
                  ...current,
                  sections: current.sections.map((item) =>
                    item.id === section.id ? { ...item, helpText } : item,
                  ),
                })),
              onChange: (content) =>
                updateDraft((current) => ({
                  ...current,
                  sections: current.sections.map((item) =>
                    item.id === section.id ? { ...item, content } : item,
                  ),
                })),
              onDelete: () => deleteTemplateSection(section.id),
            })}
            {index < draft.sections.length - 1 ? <div className="soft-divider" /> : null}
          </section>
        );
      })}
    </div>
  );

  const workflowSetupContent = isDevProjectTemplate ? (
    <Panel>
      <div className="space-y-4">
        <div className="surface-subtle space-y-3 px-4 py-4">
          <h2 className="text-lg font-semibold tracking-[0.005em]">Step 0</h2>
          <p className="max-w-4xl text-sm leading-7 text-foreground-soft">
            Discuss your idea/product. Start defining things. Once the project reaches a point
            where we can formulate a Dev Project Master Document, move to the next step.
          </p>
        </div>

        <div className="surface-subtle space-y-4 px-4 py-4">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold tracking-[0.005em]">Step 1</h2>
            <p className="max-w-4xl text-sm leading-7 text-foreground-soft">
              Define and adapt this template so that it is strictly tailored to the specific
              project you are working on. Iterate until it is perfect.
            </p>
          </div>

        <CopyPromptField
  label="Template adaptation prompt"
  buttonLabel="Copy prompt"
  prompt={DEV_PROJECT_STEP_ONE_ADAPT_PROMPT}
  textareaHeight="min-h-[120px]"
/>

          <p className="max-w-4xl text-sm leading-7 text-foreground-soft">
            When this is done you have a customized Dev Project Master Document to fill in. Take
            each section separately and request output for each section:
          </p>

          <CopyPromptField
            label="Section fill prompt"
            buttonLabel="Copy prompt"
            prompt={DEV_PROJECT_SECTION_FILL_PROMPT}
          />
        </div>
      </div>
    </Panel>
  ) : null;

  const floatingPanels = [
    {
      id: "template-sections",
      title: "Sections",
      content: renderTemplateSectionsNav({
        draft,
        onAdd: addTemplateSection,
        onJump: handleJumpToSection,
        onDelete: deleteTemplateSection,
      }),
    },
    {
      id: "template-preview",
      title: "Live Preview",
      content: (
        <DocumentPreview
          title={resolvedTitle}
          metaLines={templateMetaLines}
          sections={templatePreviewSections}
          fontScale={fontScale}
          emptyText=""
        />
      ),
    },
    ...(layoutMode === "single"
      ? [
          {
            id: "template-document",
            title: "Document",
            content: templateDocumentContent,
          },
        ]
      : []),
    ...draft.sections.map((section, index) => ({
      id: `template-section-${section.id}`,
      title: section.title,
      content: renderTemplateSectionEditor({
        draftSection: section,
        sectionIndex: index,
        fontScale,
        displayMode: "panel",
        onTitleChange: (title) =>
          updateTemplateSectionTitle(section.id, title),
        onHelpTextChange: (helpText) =>
          updateDraft((current) => ({
            ...current,
            sections: current.sections.map((item) =>
              item.id === section.id ? { ...item, helpText } : item,
            ),
          })),
        onChange: (content) =>
          updateDraft((current) => ({
            ...current,
            sections: current.sections.map((item) =>
              item.id === section.id ? { ...item, content } : item,
            ),
          })),
        onDelete: () => deleteTemplateSection(section.id),
      }),
    })),
  ].filter((panel) => isFloating(panel.id));

  return (
    <div className="page-frame mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-6 md:px-6">
      <PageHeader
        eyebrow="Template editor"
        title={activeTemplate.name}
        description={activeTemplate.description}
        actions={
          <>
            <Button variant="secondary" onClick={handleExportMarkdown}>
              <Download className="size-4" />
              Export Markdown
            </Button>
            <Button variant="primary" onClick={handleExportPdf}>
              <FileDown className="size-4" />
              Export PDF
            </Button>
          </>
        }
      />

      <div
        className={[
          "editor-grid",
          isFloating("template-sections")
            ? "workspace-columns-right"
            : "workspace-columns-both",
        ].join(" ")}
      >
        {!isFloating("template-sections") ? (
          <Panel className="h-fit xl:sticky xl:top-6">
            <DockedPanelHeader
              title="Sections"
              onDetach={() => floatPanel("template-sections")}
            />
            <div className="scroll-panel mt-4">
              {renderTemplateSectionsNav({
                draft,
                onAdd: addTemplateSection,
                onJump: handleJumpToSection,
                onDelete: deleteTemplateSection,
              })}
            </div>
          </Panel>
        ) : null}

        <div className="space-y-4">
          {workflowSetupContent}

          {layoutMode === "single" && !isFloating("template-document") ? (
            <Panel className="section-anchor stagger-enter">
              <div className="flex items-center gap-2">
                <StatusPill tone="default">Continuous</StatusPill>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => floatPanel("template-document")}
                >
                  <PinOff className="size-3.5" />
                  Float
                </Button>
              </div>
              <div className="mt-6">{templateDocumentContent}</div>
            </Panel>
          ) : layoutMode === "single" ? null : (
            dockedSections.map((section) => {
            const sectionIndex = draft.sections.findIndex((item) => item.id === section.id);
            const status = getTemplateSectionStatus(section);

            return (
              <Panel key={section.id} className="section-anchor stagger-enter">
                <section id={section.id} className="section-anchor">
                  <DockedPanelHeader
                    title={section.title}
                    subtitle={`Section ${sectionIndex + 1}`}
                    onDetach={() => floatPanel(`template-section-${section.id}`)}
                    status={
                      status.label ? (
                        <StatusPill tone={status.tone}>
                          {status.label}
                        </StatusPill>
                      ) : null
                    }
                  />
                  <div className="mt-4">
                    {renderTemplateSectionEditor({
                      draftSection: section,
                      sectionIndex,
                      fontScale,
                      displayMode: "panel",
                      onTitleChange: (title) =>
                        updateDraft((current) => ({
                          ...current,
                          sections: current.sections.map((item) =>
                            item.id === section.id ? { ...item, title } : item,
                          ),
                        })),
                      onHelpTextChange: (helpText) =>
                        updateDraft((current) => ({
                          ...current,
                          sections: current.sections.map((item) =>
                            item.id === section.id ? { ...item, helpText } : item,
                          ),
                        })),
                      onChange: (content) =>
                        updateDraft((current) => ({
                          ...current,
                          sections: current.sections.map((item) =>
                            item.id === section.id ? { ...item, content } : item,
                          ),
                        })),
                      onDelete: () => deleteTemplateSection(section.id),
                    })}
                  </div>
                </section>
              </Panel>
            );
          }))}
          {syncPassContent ? (
            <Panel className="section-anchor stagger-enter">{syncPassContent}</Panel>
          ) : null}
        </div>

        <div className="sticky-stack-scroll space-y-4">
          <Panel>
            <div className="space-y-4">
              <div>
                <div className="mono-label">Document settings</div>
                <h2 className="mt-2 text-lg font-semibold tracking-[0.005em]">
                  File name and export
                </h2>
              </div>

              <div className="grid gap-4">
                <ControlGroup
                  label="Layout"
                  options={[
                    { value: "single", label: "Continuous", icon: <Rows3 className="size-3.5" /> },
                    { value: "split", label: "Split", icon: <Columns2 className="size-3.5" /> },
                  ]}
                  value={layoutMode}
                  onChange={(value) => onLayoutModeChange(value as EditorLayoutMode)}
                />
                <ControlGroup
                  label="Text size"
                  options={[
                    { value: "sm", label: "S", icon: <Type className="size-3.5" /> },
                    { value: "md", label: "M", icon: <Type className="size-4" /> },
                    { value: "lg", label: "L", icon: <Type className="size-[1.05rem]" /> },
                  ]}
                  value={fontScale}
                  onChange={(value) => onFontScaleChange(value as EditorFontScale)}
                />
              </div>

              <Field
                label="Project name"
                hint="Used as the document title in live preview and exported documents."
              >
                <Input
                  placeholder={getTemplateDefaultProjectPrefix(activeTemplate)}
                  value={draft.title}
                  onChange={(event) =>
                    updateDraft((current) => ({ ...current, title: event.target.value }))
                  }
                />
              </Field>

              <Field
                label="Document"
                hint="Fixed document label used in live preview and exported documents."
              >
                <Input value={activeTemplate.name} readOnly />
              </Field>

              <Field label="Owner" hint="Shown in live preview and exported documents.">
                <Input
                  placeholder="Owner"
                  value={draft.owner}
                  onChange={(event) =>
                    updateDraft((current) => ({ ...current, owner: event.target.value }))
                  }
                />
              </Field>

              <Field
                label="Created"
                hint="Use YYYY-MM-DD format, for example 2026-04-23."
              >
                <Input
                  type="date"
                  value={draft.created}
                  onChange={(event) =>
                    updateDraft((current) => ({ ...current, created: event.target.value }))
                  }
                />
              </Field>

              <Field
                label="Last updated"
                hint="Use YYYY-MM-DD format, for example 2026-04-23."
              >
                <Input
                  type="date"
                  value={draft.lastUpdated}
                  onChange={(event) =>
                    updateDraft((current) => ({ ...current, lastUpdated: event.target.value }))
                  }
                />
              </Field>

              <Field
                label="File name"
                hint={`Generated automatically as ${resolvedFileName}.md / ${resolvedFileName}.pdf`}
              >
                <Input
                  value={resolvedFileName}
                  readOnly
                />
              </Field>

              <div className="grid gap-2">
                <Button variant="primary" onClick={handleExportPdf}>
                  <FileDown className="size-4" />
                  Save PDF
                </Button>
                <Button variant="secondary" onClick={handleExportMarkdown}>
                  <Download className="size-4" />
                  Save Markdown
                </Button>
                <Button
                  variant="ghost"
                  onClick={() =>
                    updateDraft(() => createTemplateDraft(activeTemplate))
                  }
                >
                  <RefreshCcw className="size-4" />
                  Reset draft
                </Button>
              </div>
            </div>
          </Panel>

          {!isFloating("template-preview") ? (
            <Panel>
              <DockedPanelHeader
                title="Live Preview"
                subtitle={resolvedFileName}
                onDetach={() => floatPanel("template-preview")}
              />
              <div className="mt-4">
                <DocumentPreview
                  title={resolvedTitle}
                  metaLines={templateMetaLines}
                  sections={templatePreviewSections}
                  fontScale={fontScale}
                  emptyText=""
                />
              </div>
            </Panel>
          ) : null}
        </div>
      </div>

      <FloatingPanelLayer
        panels={floatingPanels}
        state={panels}
        onDock={dockPanel}
        onToggleLock={toggleLock}
        onToggleExpanded={toggleExpanded}
        onStartDrag={startDrag}
        onStartResize={startResize}
      />
    </div>
  );
}

function VibeCodingPage({
  draft,
  onChange,
  fontScale,
  onFontScaleChange,
}: {
  draft: VibeCodingDraft;
  onChange: React.Dispatch<React.SetStateAction<VibeCodingDraft>>;
  fontScale: EditorFontScale;
  onFontScaleChange: React.Dispatch<React.SetStateAction<EditorFontScale>>;
}) {
  const normalizedDraft = normalizeVibeCodingDraft(draft);
  const latestVibeCodingDraftRef = useRef(normalizedDraft);
  const [activeStepId, setActiveStepId] = useState<string>(() => normalizedDraft.steps[0]?.id ?? "");

  useEffect(() => {
    latestVibeCodingDraftRef.current = normalizedDraft;
  }, [normalizedDraft]);

  useEffect(() => {
    if (!normalizedDraft.steps.length) {
      setActiveStepId("");
      return;
    }

    const activeExists = normalizedDraft.steps.some((step) => step.id === activeStepId);
    if (activeExists) {
      return;
    }

    const nextStep = normalizedDraft.steps.find((step) => !step.completed) ?? normalizedDraft.steps[0];
    setActiveStepId(nextStep.id);
  }, [activeStepId, normalizedDraft.steps]);

  const activeStep =
    normalizedDraft.steps.find((step) => step.id === activeStepId) ?? normalizedDraft.steps[0] ?? null;
  const activeStepIndex = activeStep
    ? normalizedDraft.steps.findIndex((step) => step.id === activeStep.id)
    : -1;

  const panelIds = useMemo(
    () => [
      "vibe-overview",
      "vibe-steps",
      "vibe-active-step",
      "vibe-codex-build",
      "vibe-preview",
    ],
    [],
  );
  const {
    panels,
    isFloating,
    floatPanel,
    dockPanel,
    toggleLock,
    toggleExpanded,
    startDrag,
    startResize,
  } = usePanelWorkspace(panelIds);
  const resolvedTitle = normalizedDraft.title.trim() || "Shipkit Build System";
  const resolvedFileName = buildVibeCodingFileName(normalizedDraft.title);
  const vibeMetaLines = createVibeCodingMetaLines(normalizedDraft);
  const previewSections = getVibeCodingExportSections(normalizedDraft);

  function applyVibeCodingDraft(updater: (current: VibeCodingDraft) => VibeCodingDraft) {
    onChange((current) => {
      const normalizedCurrent = normalizeVibeCodingDraft(current);
      const next = updater(normalizedCurrent);
      latestVibeCodingDraftRef.current = next;
      return {
        ...next,
        updatedAt: new Date().toISOString(),
      };
    });
  }

  function updateStep(
    stepId: string,
    updater: (current: VibeCodingStepDraft) => VibeCodingStepDraft,
  ) {
    applyVibeCodingDraft((current) => ({
      ...current,
      steps: current.steps.map((step) => (step.id === stepId ? updater(step) : step)),
    }));
  }

  function addVibeCodingStep() {
    applyVibeCodingDraft((current) => ({
      ...current,
      steps: [
        ...current.steps,
        createVibeCodingStepDraft({
          id: createDraftSectionId("vibe-step"),
          title: `Part ${current.steps.length + 1} — New workflow step`,
          tool: "ChatGPT",
          goal: "Use this step for project-specific vibe-coding workflow guidance.",
          requiredInputs: [
            "What you need before you can run this step.",
          ],
          howToUse: [
            "Paste the prompt into the right tool.",
            "Capture the useful result in Project output.",
            "Export the artifact when the step is done.",
          ],
          artifactLabel: "Working artifact",
          artifactPrefix: "workflow-step",
          artifactTemplate: "workflow-step-[project-name].md",
          artifactUsedFor: "Use this in the next relevant step.",
          outputPlaceholder: "[Paste the actual result of this step here]",
          prompt: "",
        }),
      ],
    }));
  }

  function deleteVibeCodingStep(stepId: string) {
    applyVibeCodingDraft((current) => ({
      ...current,
      steps: current.steps.filter((step) => step.id !== stepId),
    }));
  }

  function handleSelectStep(stepId: string) {
    setActiveStepId(stepId);
  }

  function moveToAdjacentStep(direction: "prev" | "next") {
    if (!activeStep) {
      return;
    }

    const nextIndex = direction === "next" ? activeStepIndex + 1 : activeStepIndex - 1;
    const nextStep = normalizedDraft.steps[nextIndex];
    if (!nextStep) {
      return;
    }

    setActiveStepId(nextStep.id);
  }

  function handleExportMarkdown() {
    const currentDraft = latestVibeCodingDraftRef.current;
    const currentTitle = currentDraft.title.trim() || "Shipkit Build System";
    const markdown = getVibeCodingExportMarkdown(currentDraft, currentTitle);
    const currentFileName = buildVibeCodingFileName(currentDraft.title);
    downloadTextFile(`${currentFileName}.md`, markdown);
  }

  function handleExportPdf() {
    const currentDraft = latestVibeCodingDraftRef.current;
    const currentTitle = currentDraft.title.trim() || "Shipkit Build System";
    const currentFileName = buildVibeCodingFileName(currentDraft.title);
    exportPdfDocument(
      currentFileName,
      currentTitle,
      getVibeCodingExportSections(currentDraft),
      createVibeCodingMetaLines(currentDraft),
      "",
    );
  }
  const workflowOverviewContent = (
    <div className="space-y-4">
      <div className="surface-subtle px-4 py-4">
        <div className="mono-label">Current focus</div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <StatusPill tone="default">
            Step {activeStepIndex >= 0 ? activeStepIndex + 1 : 0} / {normalizedDraft.steps.length}
          </StatusPill>
          {activeStep ? (
            <StatusPill tone={activeStep.completed ? "success" : "warning"}>
              {activeStep.completed ? "This step is done" : "Work in progress"}
            </StatusPill>
          ) : null}
        </div>
        <p className="mt-3 text-sm leading-7 text-foreground-soft">
          Focus on one step at a time. Finish the current step, capture your project output, then move on.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {normalizedDraft.steps.map((step, index) => (
          <button
            key={step.id}
            type="button"
            onClick={() => setActiveStepId(step.id)}
            className={[
              "rounded-[20px] border px-4 py-4 text-left transition-colors",
              activeStep?.id === step.id
                ? "border-border-strong bg-[color:var(--chrome-hover)]"
                : "border-[color:var(--chrome-soft)] bg-[color:var(--chrome-soft)] hover:bg-[color:var(--chrome-hover)]",
            ].join(" ")}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="mono-label">{step.tool}</div>
              <StatusPill tone={step.completed ? "success" : "default"}>
                {step.completed ? "Done" : `Step ${index + 1}`}
              </StatusPill>
            </div>
            <h3 className="mt-3 text-sm font-semibold tracking-[0.005em]">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-foreground-soft">{step.goal}</p>
          </button>
        ))}
      </div>
    </div>
  );

  const activeStepContent = activeStep ? (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="mono-label">Step details</div>
        <div className="flex items-center gap-2">
          <StatusPill tone={activeStep.completed ? "success" : "default"}>
            {activeStep.completed ? "Complete" : "Open"}
          </StatusPill>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => floatPanel("vibe-active-step")}
          >
            <PinOff className="size-3.5" />
            Float
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="STEP TITLE">
          <Input
            value={activeStep.title}
            onChange={(event) =>
              updateStep(activeStep.id, (current) => ({
                ...current,
                title: event.target.value,
              }))
            }
            placeholder={`Step ${activeStepIndex + 1} title`}
          />
        </Field>
        <Field label="Tool">
          <Input value={activeStep.tool} readOnly />
        </Field>
      </div>

      <div className="surface-subtle px-4 py-4">
        <div className="mono-label">Goal</div>
        <p className="mt-3 text-sm leading-7 text-foreground-soft">{activeStep.goal}</p>
      </div>

      <CopyableEditableTextareaField
        label="PROMPT"
        value={activeStep.prompt}
        onChange={(prompt) =>
          updateStep(activeStep.id, (current) => ({
            ...current,
            prompt,
          }))
        }
        rows={16}
        className="text-sm leading-7"
      />

      <Field label="PROJECT OUTPUT">
        <Textarea
          value={activeStep.notes}
          onChange={(event) =>
            updateStep(activeStep.id, (current) => ({
              ...current,
              notes: event.target.value,
            }))
          }
          placeholder={activeStep.outputPlaceholder}
          rows={14}
          className={getEditorTextAreaClass(fontScale)}
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label={activeStep.artifactLabel}>
          <Input value={buildVibeCodingArtifactFileName(activeStep, normalizedDraft.title)} readOnly />
        </Field>
        <Field label="DONE">
          <div className="flex h-12 items-center rounded-2xl border border-[color:var(--input-border)] bg-[color:var(--input-bg)] px-4">
            <Checkbox
              checked={activeStep.completed}
              onChange={(event) =>
                updateStep(activeStep.id, (current) => ({
                  ...current,
                  completed: event.target.checked,
                }))
              }
            />
            <span className="ml-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {activeStep.completed ? "Done" : "Not done yet"}
            </span>
          </div>
        </Field>
      </div>

      <div className="surface-subtle px-4 py-4">
        <div className="mono-label">Generated file</div>
        <p className="mt-3 text-sm leading-7 text-foreground-soft">{activeStep.artifactUsedFor}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() =>
              downloadTextFile(
                buildVibeCodingArtifactFileName(activeStep, normalizedDraft.title),
                getVibeCodingArtifactMarkdown(activeStep, normalizedDraft),
              )
            }
          >
            <Download className="size-4" />
            Save this file
          </Button>
          <CopyButton
            value={getVibeCodingArtifactMarkdown(activeStep, normalizedDraft)}
            label="Copy file contents"
          />
        </div>
      </div>

      <div className="flex flex-wrap justify-between gap-2">
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => moveToAdjacentStep("prev")}
            disabled={activeStepIndex <= 0}
          >
            Previous step
          </Button>
          <Button
            variant="secondary"
            onClick={() => moveToAdjacentStep("next")}
            disabled={activeStepIndex === -1 || activeStepIndex >= normalizedDraft.steps.length - 1}
          >
            Next step
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={() => deleteVibeCodingStep(activeStep.id)}>
          <X className="size-3.5" />
          Delete step
        </Button>
      </div>
    </div>
  ) : (
    <div className="text-sm leading-7 text-foreground-soft">No active step.</div>
  );

  const codexBuildContent = (
    <div className="space-y-4">
      <Field label="Codex kickoff prompt">
        <div className="space-y-2">
          <Textarea
            value={normalizedDraft.kickoffPrompt}
            onChange={(event) =>
              applyVibeCodingDraft((current) => ({
                ...current,
                kickoffPrompt: event.target.value,
              }))
            }
            rows={5}
            className="text-sm leading-7"
          />
          <CopyButton value={normalizedDraft.kickoffPrompt} label="Copy prompt" />
        </div>
      </Field>

      <div className="surface-subtle px-4 py-4">
        <div className="mono-label">Build loop guidance</div>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-foreground-soft">
          {VIBE_CODING_BUILD_LOOP_GUIDANCE.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>


<div className="surface-subtle px-4 py-4">
  <div className="mono-label">Project skeleton guidance</div>
  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-foreground-soft">
    {VIBE_CODING_PROJECT_SKELETON_GUIDANCE.map((item, i, arr) => {
      const isCode = item.includes("\n");
      const isFirst = i === 0;
      const isLast = i === arr.length - 1;

      const noBullet = isCode || isFirst || isLast;

      return (
        <li
          key={item}
          className={noBullet ? "list-none pl-0" : ""}
        >
          {isCode ? (
            <pre className="mt-2 rounded-lg bg-muted p-4 text-sm overflow-x-auto font-mono whitespace-pre">
              {item}
            </pre>
          ) : (
            item
          )}
        </li>
      );
    })}
  </ul>
</div>


      <div className="surface-subtle px-4 py-4">
        <div className="mono-label">Deployment guidance</div>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-foreground-soft">
          {VIBE_CODING_DEPLOYMENT_GUIDANCE.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );

  const activeStepHowToUseContent = activeStep ? (
    <div className="surface-subtle px-4 py-4">
      <div className="mono-label">How to use this step</div>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-foreground-soft">
        {activeStep.howToUse.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  ) : null;

  const floatingPanels = [
    {
      id: "vibe-overview",
      title: "Workflow overview",
      content: workflowOverviewContent,
    },
    {
      id: "vibe-steps",
      title: "Steps",
      content: renderVibeCodingStepsNav({
        draft: normalizedDraft,
        projectName: normalizedDraft.title,
        onAdd: addVibeCodingStep,
        activeStepId,
        onSelect: handleSelectStep,
        onDelete: deleteVibeCodingStep,
      }),
    },
    {
      id: "vibe-active-step",
      title: activeStep?.title ?? "Active step",
      content: activeStepContent,
    },
    {
      id: "vibe-codex-build",
      title: "Codex build loop",
      content: codexBuildContent,
    },
    {
      id: "vibe-preview",
      title: "Live Preview",
      content: (
        <DocumentPreview
          title={resolvedTitle}
          metaLines={vibeMetaLines}
          sections={previewSections}
          fontScale={fontScale}
          emptyText=""
        />
      ),
    },
  ].filter((panel) => isFloating(panel.id));

  return (
    <div className="page-frame mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-6 md:px-6">
      <PageHeader
        eyebrow="Vibe coding"
        title="Vibe Coding"
        description="Run the project from deep research to Codex build execution in one guided workspace, then export the workflow as clean Markdown or PDF."
        actions={
          <>
            <Button variant="secondary" onClick={handleExportMarkdown}>
              <Download className="size-4" />
              Export Markdown
            </Button>
            <Button variant="primary" onClick={handleExportPdf}>
              <FileDown className="size-4" />
              Export PDF
            </Button>
          </>
        }
      />

      <div
        className={[
          "editor-grid",
          isFloating("vibe-steps") ? "workspace-columns-right" : "workspace-columns-both",
        ].join(" ")}
      >
        {!isFloating("vibe-steps") ? (
          <Panel className="h-fit xl:sticky xl:top-6">
            <DockedPanelHeader title="Steps" onDetach={() => floatPanel("vibe-steps")} />
            <div className="scroll-panel mt-4">
              {renderVibeCodingStepsNav({
                draft: normalizedDraft,
                projectName: normalizedDraft.title,
                onAdd: addVibeCodingStep,
                activeStepId,
                onSelect: handleSelectStep,
                onDelete: deleteVibeCodingStep,
              })}
            </div>
          </Panel>
        ) : null}

        <div className="space-y-4">
          {!isFloating("vibe-overview") ? (
            <Panel>
              <DockedPanelHeader
                title="How to work here"
                onDetach={() => floatPanel("vibe-overview")}
              />
              <div className="mt-4">{workflowOverviewContent}</div>
            </Panel>
          ) : null}

          {activeStepHowToUseContent ? (
            <Panel>
              <DockedPanelHeader title="How to use this step" />
              <div className="mt-4">{activeStepHowToUseContent}</div>
            </Panel>
          ) : null}

          {!isFloating("vibe-active-step") ? (
            <Panel>
              <DockedPanelHeader
                title={activeStep?.title ?? "Active step"}
                subtitle={activeStep ? `Step ${activeStepIndex + 1}` : undefined}
                onDetach={() => floatPanel("vibe-active-step")}
                status={
                  activeStep ? (
                    <StatusPill tone={activeStep.completed ? "success" : "default"}>
                      {activeStep.completed ? "Complete" : "Open"}
                    </StatusPill>
                  ) : null
                }
              />
              <div className="mt-4">{activeStepContent}</div>
            </Panel>
          ) : null}

          {activeStep?.tool === "Codex" && !isFloating("vibe-codex-build") ? (
            <Panel className="stagger-enter">
              <DockedPanelHeader
                title="Codex build loop"
                onDetach={() => floatPanel("vibe-codex-build")}
              />
              <div className="mt-4">{codexBuildContent}</div>
            </Panel>
          ) : null}
        </div>

        <div className="sticky-stack-scroll space-y-4">
          <Panel>
            <div className="space-y-4">
              <div>
                <div className="mono-label">Document settings</div>
                <h2 className="mt-2 text-lg font-semibold tracking-[0.005em]">
                  File name and export
                </h2>
              </div>

              <ControlGroup
                label="Text size"
                options={[
                  { value: "sm", label: "S", icon: <Type className="size-3.5" /> },
                  { value: "md", label: "M", icon: <Type className="size-4" /> },
                  { value: "lg", label: "L", icon: <Type className="size-[1.05rem]" /> },
                ]}
                value={fontScale}
                onChange={(value) => onFontScaleChange(value as EditorFontScale)}
              />

              <Field
                label="Project name"
                hint="Used as the document title and for generated artifact file names across the workflow."
              >
                <Input
                  placeholder="Project name"
                  value={normalizedDraft.title}
                  onChange={(event) =>
                    applyVibeCodingDraft((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                />
              </Field>

              <Field
                label="Document"
                hint="Fixed document label used in live preview and exported documents."
              >
                <Input value="Shipkit Build System" readOnly />
              </Field>

              <Field label="Owner" hint="Shown in live preview and exported documents.">
                <Input
                  placeholder="Owner"
                  value={normalizedDraft.owner}
                  onChange={(event) =>
                    applyVibeCodingDraft((current) => ({
                      ...current,
                      owner: event.target.value,
                    }))
                  }
                />
              </Field>

              <Field label="Created" hint="Use YYYY-MM-DD format, for example 2026-04-24.">
                <Input
                  type="date"
                  value={normalizedDraft.created}
                  onChange={(event) =>
                    applyVibeCodingDraft((current) => ({
                      ...current,
                      created: event.target.value,
                    }))
                  }
                />
              </Field>

              <Field label="Last updated" hint="Use YYYY-MM-DD format, for example 2026-04-24.">
                <Input
                  type="date"
                  value={normalizedDraft.lastUpdated}
                  onChange={(event) =>
                    applyVibeCodingDraft((current) => ({
                      ...current,
                      lastUpdated: event.target.value,
                    }))
                  }
                />
              </Field>

              <Field
                label="File name"
                hint={`Generated automatically as ${resolvedFileName}.md / ${resolvedFileName}.pdf`}
              >
                <Input value={resolvedFileName} readOnly />
              </Field>

              <div className="grid gap-2">
                <Button variant="primary" onClick={handleExportPdf}>
                  <FileDown className="size-4" />
                  Save PDF
                </Button>
                <Button variant="secondary" onClick={handleExportMarkdown}>
                  <Download className="size-4" />
                  Save Markdown
                </Button>
                <Button variant="ghost" onClick={() => applyVibeCodingDraft(() => createVibeCodingDraft())}>
                  <RefreshCcw className="size-4" />
                  Reset draft
                </Button>
              </div>
            </div>
          </Panel>

          <Panel>
            <div className="space-y-4">
              <div>
                <div className="mono-label">Generated files</div>
                <h2 className="mt-2 text-lg font-semibold tracking-[0.005em]">
                  Step artifacts
                </h2>
              </div>

              <div className="space-y-3">
                {normalizedDraft.steps.map((step) => (
                  <div key={step.id} className="surface-subtle px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="mono-label">{step.tool}</div>
                        <h3 className="mt-2 text-sm font-semibold tracking-[0.005em]">
                          {buildVibeCodingArtifactFileName(step, normalizedDraft.title)}
                        </h3>
                      </div>
                      <StatusPill tone={step.completed ? "success" : "default"}>
                        {step.completed ? "Ready" : "Draft"}
                      </StatusPill>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-foreground-soft">
                      {step.artifactUsedFor}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        onClick={() =>
                          downloadTextFile(
                            buildVibeCodingArtifactFileName(step, normalizedDraft.title),
                            getVibeCodingArtifactMarkdown(step, normalizedDraft),
                          )
                        }
                      >
                        <Download className="size-4" />
                        Save file
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setActiveStepId(step.id)}>
                        Open step
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          {!isFloating("vibe-preview") ? (
            <Panel>
              <DockedPanelHeader
                title="Live Preview"
                subtitle={resolvedFileName}
                onDetach={() => floatPanel("vibe-preview")}
              />
              <div className="mt-4">
                <DocumentPreview
                  title={resolvedTitle}
                  metaLines={vibeMetaLines}
                  sections={previewSections}
                  fontScale={fontScale}
                  emptyText=""
                />
              </div>
            </Panel>
          ) : null}
        </div>
      </div>

      <FloatingPanelLayer
        panels={floatingPanels}
        state={panels}
        onDock={dockPanel}
        onToggleLock={toggleLock}
        onToggleExpanded={toggleExpanded}
        onStartDrag={startDrag}
        onStartResize={startResize}
      />
    </div>
  );
}

function CodeReviewPage({
  draft,
  onChange,
  layoutMode,
  onLayoutModeChange,
  fontScale,
  onFontScaleChange,
}: {
  draft: CodeReviewDraft;
  onChange: React.Dispatch<React.SetStateAction<CodeReviewDraft>>;
  layoutMode: EditorLayoutMode;
  onLayoutModeChange: React.Dispatch<React.SetStateAction<EditorLayoutMode>>;
  fontScale: EditorFontScale;
  onFontScaleChange: React.Dispatch<React.SetStateAction<EditorFontScale>>;
}) {
  const normalizedDraft = normalizeCodeReviewDraft(draft);
  const latestCodeReviewDraftRef = useRef(normalizedDraft);

  useEffect(() => {
    latestCodeReviewDraftRef.current = normalizedDraft;
  }, [normalizedDraft]);

  const panelIds = useMemo(
    () => [
      "review-scope",
      "review-sections",
      "review-document",
      "review-preview",
      ...normalizedDraft.sections.map((section) => `review-section-${section.id}`),
    ],
    [normalizedDraft.sections],
  );
  const {
    panels,
    isFloating,
    floatPanel,
    dockPanel,
    toggleLock,
    toggleExpanded,
    startDrag,
    startResize,
  } = usePanelWorkspace(panelIds);
  const resolvedTitle = normalizedDraft.title.trim() || "Code Review Document";
  const resolvedFileName = buildCodeReviewFileName(normalizedDraft.title);
  const reviewMetaLines = createCodeReviewMetaLines(normalizedDraft);

  function applyCodeReviewDraft(updater: (current: CodeReviewDraft) => CodeReviewDraft) {
    onChange((current) => {
      const normalizedCurrent = normalizeCodeReviewDraft(current);
      const next = updater(normalizedCurrent);
      latestCodeReviewDraftRef.current = next;
      return {
        ...next,
        updatedAt: new Date().toISOString(),
      };
    });
  }

  function updateSection(
    sectionId: string,
    updater: (current: CodeReviewSectionDraft) => CodeReviewSectionDraft,
  ) {
    applyCodeReviewDraft((normalizedCurrent) => ({
      ...normalizedCurrent,
      sections: normalizedCurrent.sections.map((section) =>
        section.id === sectionId ? updater(section) : section,
      ),
    }));
  }

  function addCodeReviewSection() {
    applyCodeReviewDraft((normalizedCurrent) => ({
      ...normalizedCurrent,
      sections: [
        ...normalizedCurrent.sections,
        {
          id: createDraftSectionId("review-section"),
          baseTitle: `NEW REVIEW SECTION ${normalizedCurrent.sections.length + 1}`,
          title: `New review section ${normalizedCurrent.sections.length + 1}`,
          checklist: "",
          findings: "",
          checked: false,
        },
      ],
    }));
  }

  function deleteCodeReviewSection(sectionId: string) {
    applyCodeReviewDraft((normalizedCurrent) => ({
      ...normalizedCurrent,
      sections: normalizedCurrent.sections.filter((section) => section.id !== sectionId),
    }));
  }

  function handleExportMarkdown() {
    const currentDraft = latestCodeReviewDraftRef.current;
    const currentTitle = currentDraft.title.trim() || "Code Review Document";
    const currentFileName = buildCodeReviewFileName(currentDraft.title);
    const currentMetaLines = createCodeReviewMetaLines(currentDraft);
    const markdown = generateCodeReviewMarkdown(currentTitle, currentDraft.sections, currentMetaLines);
    downloadTextFile(`${currentFileName}.md`, markdown);
  }

  function handleExportPdf() {
    const currentDraft = latestCodeReviewDraftRef.current;
    const currentTitle = currentDraft.title.trim() || "Code Review Document";
    const currentFileName = buildCodeReviewFileName(currentDraft.title);
    const currentMetaLines = createCodeReviewMetaLines(currentDraft);
    exportPdfDocument(
      currentFileName,
      currentTitle,
      getCodeReviewExportSections(currentDraft),
      currentMetaLines,
      "",
    );
  }

  function handleJumpToSection(sectionId: string) {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  const dockedSections = normalizedDraft.sections.filter(
    (section) => !isFloating(`review-section-${section.id}`),
  );
  const reviewDocumentContent = (
    <div className="space-y-8">
      {normalizedDraft.sections.map((section) => {
        return (
          <section key={section.id} id={section.id} className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="mono-label">Checklist section</div>
                <h3 className="mt-2 text-lg font-semibold tracking-[0.005em]">
                  {section.title}
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => floatPanel(`review-section-${section.id}`)}
              >
                <PinOff className="size-3.5" />
                Float
              </Button>
            </div>
            {renderCodeReviewSectionEditor({
              section,
              fontScale,
              displayMode: "inline",
              onChange: updateSection,
              onDelete: () => deleteCodeReviewSection(section.id),
            })}
            {section.id !== normalizedDraft.sections[normalizedDraft.sections.length - 1]?.id ? (
              <div className="soft-divider" />
            ) : null}
          </section>
        );
      })}
    </div>
  );

  const floatingPanels = [
    {
      id: "review-scope",
      title: "Review scope prompt",
      content: (
        <CopyableEditableTextareaField
          label="Review scope prompt"
          value={normalizedDraft.reviewScopePrompt}
          onChange={(reviewScopePrompt) =>
            onChange((current) => ({
              ...normalizeCodeReviewDraft(current),
              reviewScopePrompt,
              updatedAt: new Date().toISOString(),
            }))
          }
          rows={24}
          className="text-sm leading-7"
        />
      ),
    },
    {
      id: "review-sections",
      title: "Sections",
      content: renderCodeReviewSectionsNav({
        draft: normalizedDraft,
        onAdd: addCodeReviewSection,
        onJump: handleJumpToSection,
        onDelete: deleteCodeReviewSection,
      }),
    },
    {
      id: "review-preview",
      title: "Live Preview",
      content: (
        <DocumentPreview
          title={resolvedTitle}
          metaLines={reviewMetaLines}
          sections={getCodeReviewExportSections(normalizedDraft)}
          fontScale={fontScale}
          emptyText=""
        />
      ),
    },
    ...(layoutMode === "single"
      ? [
          {
            id: "review-document",
            title: "Review document",
            content: reviewDocumentContent,
          },
        ]
      : []),
    ...normalizedDraft.sections.map((section) => {
      return {
        id: `review-section-${section.id}`,
        title: section.title,
        content: renderCodeReviewSectionEditor({
          section,
          fontScale,
          displayMode: "panel",
          onChange: updateSection,
          onDelete: () => deleteCodeReviewSection(section.id),
        }),
      };
    }),
  ].filter((panel) => isFloating(panel.id));

  return (
    <div className="page-frame mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-6 md:px-6">
      <PageHeader
        eyebrow="Code review"
        title="Code Review Checklist"
        description="Review against broad categories, capture notes and findings per section, and export the whole thing as clean Markdown or PDF."
        actions={
          <>
            <Button variant="secondary" onClick={handleExportMarkdown}>
              <Download className="size-4" />
              Export Markdown
            </Button>
            <Button variant="primary" onClick={handleExportPdf}>
              <FileDown className="size-4" />
              Export PDF
            </Button>
          </>
        }
      />

      <div
        className={[
          "editor-grid",
          isFloating("review-sections") ? "workspace-columns-right" : "workspace-columns-both",
        ].join(" ")}
      >
        {!isFloating("review-sections") ? (
          <Panel className="h-fit xl:sticky xl:top-6">
            <DockedPanelHeader
              title="Sections"
              onDetach={() => floatPanel("review-sections")}
            />
            <div className="scroll-panel mt-4">
              {renderCodeReviewSectionsNav({
                draft: normalizedDraft,
                onAdd: addCodeReviewSection,
                onJump: handleJumpToSection,
                onDelete: deleteCodeReviewSection,
              })}
            </div>
          </Panel>
        ) : null}

        <div className="space-y-4">
          {!isFloating("review-scope") ? (
            <Panel className="stagger-enter">
              <DockedPanelHeader
                title="Review scope prompt"
                onDetach={() => floatPanel("review-scope")}
              />
              <div className="mt-4">
                <CopyableEditableTextareaField
                  label="Review scope prompt"
                  value={normalizedDraft.reviewScopePrompt}
                  onChange={(reviewScopePrompt) =>
                    applyCodeReviewDraft((current) => ({
                      ...current,
                      reviewScopePrompt,
                    }))
                  }
                  rows={20}
                  className="text-sm leading-7"
                />
              </div>
            </Panel>
          ) : null}

          {layoutMode === "single" && !isFloating("review-document") ? (
            <Panel className="stagger-enter">
              <DockedPanelHeader
                title="Review document"
                status={<StatusPill tone="default">Continuous</StatusPill>}
                onDetach={() => floatPanel("review-document")}
              />
              <div className="mt-6">{reviewDocumentContent}</div>
            </Panel>
          ) : layoutMode === "single" ? null : (
            dockedSections.map((section) => {
            return (
              <Panel key={section.id} className="stagger-enter">
                <section id={section.id} className="section-anchor">
                  <DockedPanelHeader
                    title={section.title}
                    onDetach={() => floatPanel(`review-section-${section.id}`)}
                  />
                  <div className="mt-4">
                    {renderCodeReviewSectionEditor({
                      section,
                      fontScale,
                      displayMode: "panel",
                      onChange: updateSection,
                      onDelete: () => deleteCodeReviewSection(section.id),
                    })}
                  </div>
                </section>
              </Panel>
            );
          }))}
        </div>

        <div className="sticky-stack-scroll space-y-4">
          <Panel>
            <div className="space-y-4">
              <div>
                <div className="mono-label">Document settings</div>
                <h2 className="mt-2 text-lg font-semibold tracking-[0.005em]">
                  File name and export
                </h2>
              </div>

              <div className="grid gap-4">
                <ControlGroup
                  label="Layout"
                  options={[
                    { value: "single", label: "Continuous", icon: <Rows3 className="size-3.5" /> },
                    { value: "split", label: "Split", icon: <Columns2 className="size-3.5" /> },
                  ]}
                  value={layoutMode}
                  onChange={(value) => onLayoutModeChange(value as EditorLayoutMode)}
                />
                <ControlGroup
                  label="Text size"
                  options={[
                    { value: "sm", label: "S", icon: <Type className="size-3.5" /> },
                    { value: "md", label: "M", icon: <Type className="size-4" /> },
                    { value: "lg", label: "L", icon: <Type className="size-[1.05rem]" /> },
                  ]}
                  value={fontScale}
                  onChange={(value) => onFontScaleChange(value as EditorFontScale)}
                />
              </div>

              <Field
                label="Project name"
                hint="Used for project-specific document naming. Leave empty to keep the default code-review file name."
              >
                <Input
                  placeholder="Project name"
                  value={normalizedDraft.title}
                  onChange={(event) =>
                    applyCodeReviewDraft((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                />
              </Field>

              <Field
                label="Document"
                hint="Fixed document label used in live preview and exported documents."
              >
                <Input value="Code Review" readOnly />
              </Field>

              <Field label="Owner" hint="Shown in live preview and exported documents.">
                <Input
                  placeholder="Owner"
                  value={normalizedDraft.owner}
                  onChange={(event) =>
                    applyCodeReviewDraft((current) => ({
                      ...current,
                      owner: event.target.value,
                    }))
                  }
                />
              </Field>

              <Field
                label="Review date"
                hint="Use YYYY-MM-DD format, for example 2026-04-23."
              >
                <Input
                  type="date"
                  value={normalizedDraft.lastChecked}
                  onChange={(event) =>
                    applyCodeReviewDraft((current) => ({
                      ...current,
                      lastChecked: event.target.value,
                    }))
                  }
                />
              </Field>

              <Field
                label="File name"
                hint={`Generated automatically as ${resolvedFileName}.md / ${resolvedFileName}.pdf`}
              >
                <Input
                  value={resolvedFileName}
                  readOnly
                />
              </Field>
              <div className="grid gap-2">
                <Button variant="primary" onClick={handleExportPdf}>
                  <FileDown className="size-4" />
                  Save PDF
                </Button>
                <Button variant="secondary" onClick={handleExportMarkdown}>
                  <Download className="size-4" />
                  Save Markdown
                </Button>
                <Button variant="ghost" onClick={() => applyCodeReviewDraft(() => createCodeReviewDraft())}>
                  <RefreshCcw className="size-4" />
                  Reset review
                </Button>
              </div>
            </div>
          </Panel>

          {!isFloating("review-preview") ? (
            <Panel>
              <DockedPanelHeader
                title="Live Preview"
                subtitle={resolvedFileName}
                onDetach={() => floatPanel("review-preview")}
              />
              <div className="mt-4">
                <DocumentPreview
                  title={resolvedTitle}
                  metaLines={reviewMetaLines}
                  sections={getCodeReviewExportSections(normalizedDraft)}
                  fontScale={fontScale}
                  emptyText=""
                />
              </div>
            </Panel>
          ) : null}
        </div>
      </div>

      <FloatingPanelLayer
        panels={floatingPanels}
        state={panels}
        onDock={dockPanel}
        onToggleLock={toggleLock}
        onToggleExpanded={toggleExpanded}
        onStartDrag={startDrag}
        onStartResize={startResize}
      />
    </div>
  );
}

type HelpDocFilter = "all" | "ai" | "product";
type CourseFilter = "all" | "frontend" | "product" | "security";

function HelpDocsLibrary({
  helpDocDrafts,
  onChange,
}: {
  helpDocDrafts: Record<string, HelpDocDraft>;
  onChange: React.Dispatch<React.SetStateAction<Record<string, HelpDocDraft>>>;
}) {
  const [filter, setFilter] = useState<HelpDocFilter>("all");
  const [activeDocSlug, setActiveDocSlug] = useState<string | null>(null);
  const filteredDocs = frameworkDocuments.filter((doc) => {
    if (filter === "all") {
      return true;
    }

    return getHelpDocCategory(doc) === filter;
  });
  const activeHelpDoc = frameworkDocuments.find((doc) => doc.slug === activeDocSlug) ?? null;

  return (
    <div className="page-frame mx-auto flex max-w-[1450px] flex-col gap-6 px-4 py-6 md:px-6">
      <PageIntro
        eyebrow="Frameworks"
        title="Frameworks"
        description="A set of brutal frameworks for pressure-testing product ideas, decisions, and thinking."
      />

      <div className="surface-subtle flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mono-label">Filter</div>
          <p className="mt-2 text-sm leading-6 text-foreground-soft">
            Narrow the library to the type of help document you need.
          </p>
        </div>
        <div className="w-full max-w-[560px]">
          <ControlGroup
            label="Visible frameworks"
            options={[
              { value: "all", label: "All" },
              { value: "ai", label: "AI" },
              { value: "product", label: "Product" },
            ]}
            value={filter}
            onChange={(value) => setFilter(value as HelpDocFilter)}
          />
        </div>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-3">
        {filteredDocs.map((doc, index) => {
          const draft = normalizeHelpDocDraft(doc, helpDocDrafts[doc.slug]);
          const resolvedTitle = doc.title;
          const editedCount = draft ? countCustomizedHelpDocSections(draft) : 0;

          return (
            <Panel
              key={doc.id}
              className="stagger-enter self-start"
              style={{ ["--enter-delay" as string]: `${0.05 * index + 0.04}s` }}
            >
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <StatusPill tone="default">{getHelpDocCategoryLabel(doc)}</StatusPill>
                    <h2 className="text-xl font-semibold tracking-[0.005em]">{resolvedTitle}</h2>
                  </div>
                  {editedCount > 0 ? (
                    <StatusPill tone="success">{editedCount} edits</StatusPill>
                  ) : null}
                </div>

                <p className="max-w-[32ch] text-sm leading-6 text-foreground-soft">
                  {doc.description}
                </p>

                <div className="block pt-1">
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => setActiveDocSlug(doc.slug)}
                  >
                    <FilePenLine data-icon="inline-start" className="size-4" />
                    Open framework
                  </Button>
                </div>
              </div>
            </Panel>
          );
        })}
      </div>

      {activeHelpDoc ? (
        <HelpDocFloatingCard
          doc={activeHelpDoc}
          draft={normalizeHelpDocDraft(activeHelpDoc, helpDocDrafts[activeHelpDoc.slug])}
          onChange={(updater) => {
            onChange((current) => {
              const base = normalizeHelpDocDraft(activeHelpDoc, current[activeHelpDoc.slug]);
              const next = updater(base);
              return {
                ...current,
                [activeHelpDoc.slug]: {
                  ...next,
                  updatedAt: new Date().toISOString(),
                },
              };
            });
          }}
          onClose={() => setActiveDocSlug(null)}
        />
      ) : null}
    </div>
  );
}

function CoursesLibrary({
  courseDrafts,
  onChange,
}: {
  courseDrafts: Record<string, HelpDocDraft>;
  onChange: React.Dispatch<React.SetStateAction<Record<string, HelpDocDraft>>>;
}) {
  const [filter, setFilter] = useState<CourseFilter>("all");
  const [activeDocSlug, setActiveDocSlug] = useState<string | null>(null);
  const filteredDocs = courseDocuments.filter((doc) => {
    if (filter === "all") {
      return true;
    }

    return getCourseCategory(doc) === filter;
  });
  const activeCourseDoc = courseDocuments.find((doc) => doc.slug === activeDocSlug) ?? null;

  return (
    <div className="page-frame mx-auto flex max-w-[1450px] flex-col gap-6 px-4 py-6 md:px-6">
      <PageIntro
        eyebrow="Courses"
        title="Courses"
        description="Interactive AI course prompt templates for structured learning in product, frontend, and cybersecurity."
      />

      <div className="surface-subtle flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mono-label">Filter</div>
          <p className="mt-2 text-sm leading-6 text-foreground-soft">
            Narrow the library to the kind of course prompt you want to use.
          </p>
        </div>
        <div className="w-full max-w-[720px]">
          <ControlGroup
            label="Visible courses"
            options={[
              { value: "all", label: "All" },
              { value: "frontend", label: "Frontend" },
              { value: "product", label: "Product" },
              { value: "security", label: "Security" },
            ]}
            value={filter}
            onChange={(value) => setFilter(value as CourseFilter)}
          />
        </div>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-3">
        {filteredDocs.map((doc, index) => {
          const draft = normalizeHelpDocDraft(doc, courseDrafts[doc.slug]);
          const editedCount = draft ? countCustomizedHelpDocSections(draft) : 0;

          return (
            <Panel
              key={doc.id}
              className="stagger-enter self-start"
              style={{ ["--enter-delay" as string]: `${0.05 * index + 0.04}s` }}
            >
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <StatusPill tone="default">{getCourseCategoryLabel(doc)}</StatusPill>
                    <h2 className="text-xl font-semibold tracking-[0.005em]">{doc.title}</h2>
                  </div>
                  {editedCount > 0 ? (
                    <StatusPill tone="success">{editedCount} edits</StatusPill>
                  ) : null}
                </div>

                <p className="max-w-[32ch] text-sm leading-6 text-foreground-soft">
                  {doc.description}
                </p>

                <div className="block pt-1">
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => setActiveDocSlug(doc.slug)}
                  >
                    <FilePenLine data-icon="inline-start" className="size-4" />
                    Open course
                  </Button>
                </div>
              </div>
            </Panel>
          );
        })}
      </div>

      {activeCourseDoc ? (
        <HelpDocFloatingCard
          doc={activeCourseDoc}
          draft={normalizeHelpDocDraft(activeCourseDoc, courseDrafts[activeCourseDoc.slug])}
          onChange={(updater) => {
            onChange((current) => {
              const base = normalizeHelpDocDraft(activeCourseDoc, current[activeCourseDoc.slug]);
              const next = updater(base);
              return {
                ...current,
                [activeCourseDoc.slug]: {
                  ...next,
                  updatedAt: new Date().toISOString(),
                },
              };
            });
          }}
          onClose={() => setActiveDocSlug(null)}
          copyLabel="Copy contents"
        />
      ) : null}
    </div>
  );
}

function HelpDocFloatingCard({
  doc,
  draft,
  onChange,
  onClose,
  copyLabel = "Copy contents",
}: {
  doc: LibraryDocument;
  draft: HelpDocDraft;
  onChange: (updater: (current: HelpDocDraft) => HelpDocDraft) => void;
  onClose: () => void;
  copyLabel?: string;
}) {
  const [copied, setCopied] = useState(false);
  const resolvedTitle = doc.title;
  const resolvedFileName = buildHelpDocFileName(resolvedTitle, doc.slug);
  const markdown = generateHelpDocMarkdown(resolvedTitle, draft.content);

  async function handleCopyContents() {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      downloadTextFile(`${resolvedFileName}.md`, markdown);
    }
  }

  return (
    <div className="fixed inset-0 z-[45] bg-black/18 backdrop-blur-[2px]" onClick={onClose}>
      <div
        className="floating-window overflow-hidden"
        style={{
          left: "50%",
          top: 24,
          transform: "translateX(-50%)",
          width: "min(980px, calc(100vw - 32px))",
          height: "min(86vh, 920px)",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="h-full overflow-auto px-6 py-5 md:px-7 md:py-6">
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={handleCopyContents}>
              <Copy className="size-4" />
              {copied ? "Copied" : copyLabel}
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="size-4" />
            </Button>
          </div>
          <div className="mx-auto mt-1 max-w-4xl space-y-6">
            <div>
              <h1 className="text-4xl font-semibold tracking-[0.01em] text-gradient md:text-5xl">
                {doc.title}
              </h1>
            </div>

            <Field label="Content">
              <Textarea
                value={draft.content}
                onChange={(event) =>
                  onChange((current) => ({ ...current, content: event.target.value }))
                }
                className="min-h-[56vh] text-base leading-7"
                rows={20}
              />
            </Field>
          </div>
        </div>
      </div>
    </div>
  );
}

function ControlGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<{ value: string; label: string; icon?: ReactNode }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="mono-label">{label}</div>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={[
              "flex items-center justify-center gap-1.5 rounded-2xl border px-3 py-2.5 text-xs font-medium transition-colors",
              value === option.value
                ? "border-border-strong bg-[color:var(--chrome-strong)] text-foreground"
                : "border-[color:var(--chrome-soft)] bg-[color:var(--chrome-soft)] text-muted-foreground hover:bg-[color:var(--chrome-hover)] hover:text-foreground",
            ].join(" ")}
          >
            {option.icon}
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function DockedPanelHeader({
  title,
  subtitle,
  onDetach,
  status,
}: {
  title: string;
  subtitle?: string;
  onDetach?: () => void;
  status?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        {subtitle ? <div className="mono-label">{subtitle}</div> : null}
        <h2 className="mt-2 text-lg font-semibold tracking-[0.005em]">{title}</h2>
      </div>
      <div className="flex items-center gap-2">
        {status}
        {onDetach ? (
          <Button variant="ghost" size="sm" onClick={onDetach}>
            <PinOff className="size-3.5" />
            Float
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function FloatingPanelLayer({
  panels,
  state,
  onDock,
  onToggleLock,
  onToggleExpanded,
  onStartDrag,
  onStartResize,
}: {
  panels: Array<{ id: string; title: string; content: ReactNode }>;
  state: FloatingPanelMap;
  onDock: (id: string) => void;
  onToggleLock: (id: string) => void;
  onToggleExpanded: (id: string) => void;
  onStartDrag: (id: string, event: React.PointerEvent<HTMLElement>) => void;
  onStartResize: (id: string, event: React.PointerEvent<HTMLElement>) => void;
}) {
  if (panels.length === 0) {
    return null;
  }

  return (
    <div className="floating-layer">
      {panels.map((panel) => {
        const panelState = state[panel.id];

        if (!panelState || panelState.mode !== "floating") {
          return null;
        }

        return (
          <div
            key={panel.id}
            className="floating-window"
            style={{
              left: panelState.x,
              top: panelState.y,
              width: panelState.width,
              height: panelState.height,
              zIndex: panelState.z,
            }}
          >
            <div
              className="floating-window-header"
              onPointerDown={(event) => onStartDrag(panel.id, event)}
            >
              <div className="min-w-0">
                <div className="mono-label">Detached panel</div>
                <div className="truncate text-sm font-medium text-foreground">
                  {panel.title}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => onToggleLock(panel.id)}
                >
                  {panelState.locked ? (
                    <Lock className="size-3.5" />
                  ) : (
                    <LockOpen className="size-3.5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => onToggleExpanded(panel.id)}
                >
                  {panelState.expanded ? (
                    <Minimize2 className="size-3.5" />
                  ) : (
                    <Maximize2 className="size-3.5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => onDock(panel.id)}
                >
                  <Pin className="size-3.5" />
                  Dock
                </Button>
              </div>
            </div>
            <div className="floating-window-body">{panel.content}</div>
            <button
              type="button"
              aria-label="Resize panel"
              className={[
                "floating-window-resize",
                panelState.locked ? "pointer-events-none opacity-35" : "",
              ].join(" ")}
              onPointerDown={(event) => onStartResize(panel.id, event)}
            />
          </div>
        );
      })}
    </div>
  );
}

function renderTemplateSectionsNav({
  draft,
  onAdd,
  onJump,
  onDelete,
}: {
  draft: TemplateDraft;
  onAdd?: () => void;
  onJump?: (sectionId: string) => void;
  onDelete?: (sectionId: string) => void;
}) {
  return (
    <div className="space-y-3">
      {onAdd ? (
        <Button variant="secondary" className="w-full" onClick={onAdd}>
          <Plus className="size-4" />
          Add section
        </Button>
      ) : null}
      {draft.sections.map((section, index) => {
        const status = getTemplateSectionStatus(section);

        return (
          <div
            key={section.id}
            className="flex items-center gap-2 rounded-[18px] border border-transparent px-2 py-1.5 transition-colors hover:bg-[color:var(--chrome-soft)]"
          >
            <button
              type="button"
              onClick={() => onJump?.(section.id)}
              className="flex min-w-0 flex-1 items-center justify-between gap-3 px-1 py-1 text-left"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-foreground">{section.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Section {index + 1}
                </div>
              </div>
              {status.label ? <StatusPill tone={status.tone}>{status.label}</StatusPill> : null}
            </button>
            {onDelete ? (
              <Button variant="ghost" size="sm" onClick={() => onDelete(section.id)}>
                <X className="size-3.5" />
              </Button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function renderTemplateSectionEditor({
  draftSection,
  sectionIndex,
  fontScale,
  displayMode,
  onTitleChange,
  onHelpTextChange,
  onChange,
  onDelete,
}: {
  draftSection: TemplateDraftSection;
  sectionIndex: number;
  fontScale: EditorFontScale;
  displayMode: "panel" | "inline";
  onTitleChange: (title: string) => void;
  onHelpTextChange: (helpText: string) => void;
  onChange: (content: string) => void;
  onDelete?: () => void;
}) {
  return (
    <div className="space-y-4">
      {onDelete ? (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <X className="size-3.5" />
            Delete section
          </Button>
        </div>
      ) : null}
      <Field label="SECTION NAME">
        <Input
          value={draftSection.title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder={`Section ${sectionIndex + 1} title`}
        />
      </Field>
      {draftSection.helpText.trim() ? (
        <CopyableEditableTextareaField
          label="MUST INCLUDE"
          value={draftSection.helpText}
          onChange={onHelpTextChange}
          rows={displayMode === "panel" ? 14 : 10}
          className="text-sm leading-7"
        />
      ) : null}
      <Field label="OUTPUT">
        <Textarea
          value={draftSection.content}
          onChange={(event) => onChange(event.target.value)}
          placeholder="[Add your input here]"
          className={getEditorTextAreaClass(fontScale)}
          rows={14}
        />
      </Field>
    </div>
  );
}

function renderCodeReviewSectionsNav({
  draft,
  onAdd,
  onJump,
  onDelete,
}: {
  draft: CodeReviewDraft;
  onAdd?: () => void;
  onJump?: (sectionId: string) => void;
  onDelete?: (sectionId: string) => void;
}) {
  return (
    <div className="space-y-3">
      {onAdd ? (
        <Button variant="secondary" className="w-full" onClick={onAdd}>
          <Plus className="size-4" />
          Add section
        </Button>
      ) : null}
      {draft.sections.map((section) => (
        <div
          key={section.id}
          className="flex items-center gap-2 rounded-[18px] border border-transparent px-2 py-1.5 transition-colors hover:bg-[color:var(--chrome-soft)]"
        >
          <button
            type="button"
            onClick={() => onJump?.(section.id)}
            className="flex min-w-0 flex-1 items-center justify-between gap-3 px-1 py-1 text-left"
          >
            <span className="min-w-0 truncate text-sm font-medium text-foreground-soft">
              {section.title}
            </span>
            <StatusPill tone={section.checked ? "success" : "default"}>
              {section.checked ? "Checked" : "Open"}
            </StatusPill>
          </button>
          {onDelete ? (
            <Button variant="ghost" size="sm" onClick={() => onDelete(section.id)}>
              <X className="size-3.5" />
            </Button>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function renderHelpDocSectionsNav({
  draft,
}: {
  draft: HelpDocDraft;
}) {
  return (
    <div className="space-y-3">
      <div className="rounded-[18px] border border-border px-3 py-3 text-sm leading-6 text-foreground-soft">
        {draft.content.trim() ? "Document content available." : "No content yet."}
      </div>
    </div>
  );
}

function renderHelpDocSectionEditor({
  section,
  fontScale,
  onChange,
}: {
  section: HelpDocSectionDraft;
  fontScale: EditorFontScale;
  onChange: (content: string) => void;
}) {
  return (
    <Field label="Content">
      <Textarea
        value={section.content}
        onChange={(event) => onChange(event.target.value)}
        className={getEditorTextAreaClass(fontScale)}
        rows={14}
      />
    </Field>
  );
}

function renderCodeReviewSectionEditor({
  section,
  fontScale,
  displayMode,
  onChange,
  onDelete,
}: {
  section: CodeReviewSectionDraft;
  fontScale: EditorFontScale;
  displayMode: "panel" | "inline";
  onChange: (
    sectionId: string,
    updater: (current: CodeReviewSectionDraft) => CodeReviewSectionDraft,
  ) => void;
  onDelete?: () => void;
}) {
  return (
    <div className="space-y-4">
      {onDelete ? (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <X className="size-3.5" />
            Delete section
          </Button>
        </div>
      ) : null}

      <Field label="MARK AS CHECKED">
        <div className="flex h-12 items-center rounded-2xl border border-[color:var(--input-border)] bg-[color:var(--input-bg)] px-4">
          <Checkbox
            checked={section.checked}
            onChange={(event) =>
              onChange(section.id, (current) => ({
                ...current,
                checked: event.target.checked,
              }))
            }
          />
          <span className="ml-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {section.checked ? "Checked" : "Open"}
          </span>
        </div>
      </Field>

      <Field label="Section title">
        <Input
          value={section.title}
          onChange={(event) =>
            onChange(section.id, (current) => ({
              ...current,
              title: event.target.value,
            }))
          }
          placeholder="Section title"
        />
      </Field>

      <CopyableEditableTextareaField
        label="WHAT TO CHECK"
        value={section.checklist}
        onChange={(checklist) =>
          onChange(section.id, (current) => ({
            ...current,
            checklist,
          }))
        }
        rows={displayMode === "panel" ? 14 : 12}
        className="text-sm leading-7"
      />

      <Field label="FINDINGS">
        <Textarea
          value={section.findings}
          onChange={(event) =>
            onChange(section.id, (current) => ({
              ...current,
              findings: event.target.value,
            }))
          }
          placeholder="[Add your input here]"
          className={getEditorTextAreaClass(fontScale)}
          rows={12}
        />
      </Field>
    </div>
  );
}

function renderVibeCodingStepsNav({
  draft,
  projectName,
  activeStepId,
  onAdd,
  onSelect,
  onDelete,
}: {
  draft: VibeCodingDraft;
  projectName: string;
  activeStepId: string;
  onAdd?: () => void;
  onSelect?: (stepId: string) => void;
  onDelete?: (stepId: string) => void;
}) {
  return (
    <div className="space-y-3">
      {onAdd ? (
        <Button variant="secondary" className="w-full" onClick={onAdd}>
          <Plus className="size-4" />
          Add step
        </Button>
      ) : null}
      {draft.steps.map((step) => (
        <div
          key={step.id}
          className={[
            "flex items-center gap-2 rounded-[18px] border px-2 py-1.5 transition-colors",
            activeStepId === step.id
              ? "border-border-strong bg-[color:var(--chrome-hover)]"
              : "border-transparent hover:bg-[color:var(--chrome-soft)]",
          ].join(" ")}
        >
          <button
            type="button"
            onClick={() => onSelect?.(step.id)}
            className="flex min-w-0 flex-1 items-center justify-between gap-3 px-1 py-1 text-left"
          >
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-foreground">{step.title}</div>
              <div className="mt-1 truncate text-xs text-muted-foreground">
                {step.tool} • {buildVibeCodingArtifactFileName(step, projectName)}
              </div>
            </div>
            <StatusPill tone={step.completed ? "success" : "default"}>
              {step.completed ? "Complete" : "Open"}
            </StatusPill>
          </button>
          {onDelete ? (
            <Button variant="ghost" size="sm" onClick={() => onDelete(step.id)}>
              <X className="size-3.5" />
            </Button>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function CopyButton({
  value,
  label = "Copy",
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      downloadTextFile("copied-field.txt", value);
    }
  }

  return (
    <Button variant="secondary" onClick={handleCopy}>
      <Copy className="size-4" />
      {copied ? "Copied" : label}
    </Button>
  );
}

function getTemplateSectionStatus(draftSection: TemplateDraftSection) {
  const normalizedDraft = draftSection.content.trim();
  const normalizedBase = (draftSection.baseContent ?? "").trim();

  if (!normalizedDraft) {
    return { label: "Empty", tone: "warning" as const };
  }

  if (normalizedDraft === normalizedBase) {
    return { label: null, tone: "default" as const };
  }

  return { label: "Edited", tone: "success" as const };
}

function countCustomizedTemplateSections(draft: TemplateDraft) {
  return draft.sections.reduce((count, section) => {
    return count + Number(section.content.trim() !== (section.baseContent ?? "").trim());
  }, 0);
}

function countCustomizedTemplateDraft(template: TemplateDefinition, draft: TemplateDraft) {
  if (isSingleDocumentTemplateSlug(template.slug)) {
    return Number((draft.documentContent ?? "").trim() !== (draft.baseDocumentContent ?? "").trim());
  }

  return countCustomizedTemplateSections(draft);
}

function countCustomizedHelpDocSections(draft: HelpDocDraft) {
  return Number(draft.content.trim() !== draft.baseContent.trim());
}

function usePanelWorkspace(panelIds: string[]) {
  const [panels, setPanels] = useState<FloatingPanelMap>(() => createDefaultPanelState(panelIds));
  const dragStateRef = useRef<{
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const resizeStateRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);

  useEffect(() => {
    setPanels((current) => reconcilePanelState(current, panelIds));
  }, [panelIds]);

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      const dragState = dragStateRef.current;
      if (!dragState) {
        return;
      }

      setPanels((current) => {
        const panel = current[dragState.id];
        if (!panel || panel.locked) {
          return current;
        }

        const viewport = getViewportBounds();
        const nextX = clamp(
          event.clientX - dragState.offsetX,
          viewport.minX - panel.width + 144,
          viewport.maxX - 144,
        );
        const nextY = clamp(
          event.clientY - dragState.offsetY,
          viewport.minY - 72,
          viewport.maxY - 120,
        );
        const nextZ = getHighestZ(current) + 1;

        return {
          ...current,
          [dragState.id]: {
            ...panel,
            x: nextX,
            y: nextY,
            z: nextZ,
          },
        };
      });
    }

    function handleResizeMove(event: PointerEvent) {
      const resizeState = resizeStateRef.current;
      if (!resizeState) {
        return;
      }

      setPanels((current) => {
        const panel = current[resizeState.id];
        if (!panel || panel.locked) {
          return current;
        }

        const viewport = getViewportBounds();
        const nextWidth = clamp(
          resizeState.startWidth + (event.clientX - resizeState.startX),
          320,
          viewport.maxX - panel.x,
        );
        const nextHeight = clamp(
          resizeState.startHeight + (event.clientY - resizeState.startY),
          280,
          viewport.maxY - panel.y,
        );

        return {
          ...current,
          [resizeState.id]: {
            ...panel,
            width: nextWidth,
            height: nextHeight,
            expanded: false,
            z: getHighestZ(current) + 1,
          },
        };
      });
    }

    function handlePointerUp() {
      dragStateRef.current = null;
      resizeStateRef.current = null;
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointermove", handleResizeMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointermove", handleResizeMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  function isFloating(id: string) {
    return panels[id]?.mode === "floating";
  }

  function floatPanel(id: string) {
    setPanels((current) => {
      const preset = getPanelFloatPreset(id);
      const next = {
        ...current,
        [id]: {
          ...(current[id] ?? createSinglePanelState(0)),
          mode: "floating" as const,
          width: preset.width ?? current[id]?.width ?? 420,
          height: preset.height ?? current[id]?.height ?? 560,
          z: getHighestZ(current) + 1,
        },
      };
      return autoArrangeFloatingPanels(next);
    });
  }

  function dockPanel(id: string) {
    setPanels((current) => {
      const next = {
        ...current,
        [id]: {
          ...(current[id] ?? createSinglePanelState(0)),
          mode: "docked" as const,
        },
      };
      return autoArrangeFloatingPanels(next);
    });
  }

  function toggleExpanded(id: string) {
    setPanels((current) => {
      const existing = current[id] ?? createSinglePanelState(0);
      const viewport = getViewportBounds();
      const nextExpanded = !existing.expanded;
      const next = {
        ...current,
        [id]: {
          ...existing,
          mode: "floating" as const,
          width: nextExpanded
            ? Math.min(840, viewport.maxX - existing.x)
            : 420,
          height: nextExpanded
            ? Math.min(720, viewport.maxY - existing.y)
            : 560,
          expanded: nextExpanded,
          z: getHighestZ(current) + 1,
        },
      };
      return autoArrangeFloatingPanels(next);
    });
  }

  function toggleLock(id: string) {
    setPanels((current) => {
      const panel = current[id];
      if (!panel) {
        return current;
      }

      return {
        ...current,
        [id]: {
          ...panel,
          locked: !panel.locked,
          z: getHighestZ(current) + 1,
        },
      };
    });
  }

  function startDrag(id: string, event: React.PointerEvent<HTMLElement>) {
    const panel = panels[id];
    if (!panel || panel.locked) {
      return;
    }

    dragStateRef.current = {
      id,
      offsetX: event.clientX - panel.x,
      offsetY: event.clientY - panel.y,
    };
  }

  function startResize(id: string, event: React.PointerEvent<HTMLElement>) {
    event.stopPropagation();
    const panel = panels[id];
    if (!panel || panel.locked) {
      return;
    }

    resizeStateRef.current = {
      id,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: panel.width,
      startHeight: panel.height,
    };
  }

  return {
    panels,
    isFloating,
    floatPanel,
    dockPanel,
    toggleLock,
    toggleExpanded,
    startDrag,
    startResize,
  };
}

function createDefaultPanelState(panelIds: string[]) {
  return panelIds.reduce<FloatingPanelMap>((accumulator, panelId, index) => {
    accumulator[panelId] = createSinglePanelState(index);
    return accumulator;
  }, {});
}

function reconcilePanelState(current: FloatingPanelMap, panelIds: string[]) {
  const next: FloatingPanelMap = {};

  panelIds.forEach((panelId, index) => {
    next[panelId] = current[panelId] ?? createSinglePanelState(index);
  });

  return next;
}

function createSinglePanelState(index: number): FloatingPanelState {
  return {
    mode: "docked",
    x: 32 + (index % 3) * 56,
    y: 32 + index * 18,
    width: 420,
    height: 560,
    z: index + 10,
    expanded: false,
    locked: false,
  };
}

function getPanelFloatPreset(id: string) {
  if (id === "template-document" || id === "review-document" || id === "vibe-active-step") {
    return {
      width: 760,
      height: 720,
    };
  }

  if (id === "template-preview" || id === "review-preview" || id === "vibe-preview" || id === "vibe-codex-build") {
    return {
      width: 520,
      height: 640,
    };
  }

  return {
    width: undefined,
    height: undefined,
  };
}

function autoArrangeFloatingPanels(panels: FloatingPanelMap) {
  const floatingIds = Object.entries(panels)
    .filter(([, panel]) => panel.mode === "floating" && !panel.locked)
    .sort(([, panelA], [, panelB]) => panelA.z - panelB.z)
    .map(([id]) => id);

  if (floatingIds.length === 0) {
    return panels;
  }

  const viewport = getViewportBounds();
  let cursorX = viewport.minX;
  let cursorY = viewport.minY;
  let rowHeight = 0;

  const next = { ...panels };

  floatingIds.forEach((id, index) => {
    const panel = next[id];
    if (!panel) {
      return;
    }

    const width = Math.min(panel.width, viewport.maxX - viewport.minX);
    const height = Math.min(panel.height, viewport.maxY - viewport.minY);

    if (cursorX + width > viewport.maxX && index > 0) {
      cursorX = viewport.minX;
      cursorY += rowHeight + 18;
      rowHeight = 0;
    }

    next[id] = {
      ...panel,
      width,
      height: Math.min(height, viewport.maxY - viewport.minY),
      x: clamp(cursorX, viewport.minX, viewport.maxX - width),
      y: clamp(cursorY, viewport.minY, viewport.maxY - height),
      z: 40 + index,
    };

    cursorX += width + 18;
    rowHeight = Math.max(rowHeight, height);
  });

  return next;
}

function getViewportBounds() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  return {
    minX: 16,
    minY: 16,
    maxX: width - 16,
    maxY: height - 16,
  };
}

function getHighestZ(panels: FloatingPanelMap) {
  return Math.max(0, ...Object.values(panels).map((panel) => panel.z));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-3">
      <div className="mono-label">{eyebrow}</div>
      <h1 className="max-w-4xl text-4xl font-semibold tracking-[0.01em] text-balance text-gradient md:text-5xl">
        {title}
      </h1>
      <p className="max-w-3xl text-sm leading-7 text-foreground-soft md:text-base">{description}</p>
    </div>
  );
}

function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <PageIntro eyebrow={eyebrow} title={title} description={description} />
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

function DocumentPreview({
  title,
  metaLines = [],
  sections,
  fontScale = "md",
  emptyText = "Pending content.",
}: {
  title: string;
  metaLines?: string[];
  sections: ExportSection[];
  fontScale?: EditorFontScale;
  emptyText?: string;
}) {
  return (
    <div className="document-preview document-preview-scroll">
      <div className="border-b border-border pb-4">
        <div className="mono-label">Preview</div>
        <h3 className="mt-2 text-xl font-semibold tracking-[0.005em]">{title}</h3>
        {metaLines.length > 0 ? (
          <div className="mt-3 space-y-1">
            {metaLines.map((line) => (
              <div key={line} className="text-sm text-foreground-soft">
                {line}
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <div className="mt-5 space-y-6">
        {sections.map((section) => (
          <section key={section.title} className="space-y-2">
            {section.title ? (
              <h4 className="text-sm font-medium tracking-[0.005em] text-foreground">
                {section.title}
              </h4>
            ) : null}
            <DocumentText text={section.body} fontScale={fontScale} emptyText={emptyText} />
          </section>
        ))}
      </div>
    </div>
  );
}

function DocumentText({
  text,
  fontScale = "md",
  emptyText = "Pending content.",
}: {
  text: string;
  fontScale?: EditorFontScale;
  emptyText?: string;
}) {
  const blocks = splitTextBlocks(text, emptyText);
  const textClass = getPreviewTextClass(fontScale);

  return (
    <div className={`space-y-3 text-foreground-soft ${textClass}`}>
      {blocks.map((block, index) => {
        if (block.type === "separator") {
          return <div key={`${block.type}-${index}`} className="soft-divider" />;
        }

        if (block.type === "heading") {
          return (
            <p
              key={`${block.type}-${index}`}
              className="text-foreground text-[1.12em] font-bold tracking-[0.005em]"
            >
              {block.lines[0]}
            </p>
          );
        }

        if (block.type === "ul") {
          return (
            <ul key={`${block.type}-${index}`} className="list-disc space-y-1.5 pl-5">
              {block.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          );
        }

        if (block.type === "ol") {
          return (
            <ol key={`${block.type}-${index}`} className="list-decimal space-y-1.5 pl-5">
              {block.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ol>
          );
        }

        return (
          <p key={`${block.type}-${index}`} className="whitespace-pre-wrap text-foreground-soft">
            {block.lines.join("\n")}
          </p>
        );
      })}
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-6">
      <Panel className="w-full text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-[color:var(--chrome-strong)] bg-[color:var(--chrome-soft)]">
          <ArrowUpRight className="size-5 text-muted-foreground" />
        </div>
        <h1 className="mt-4 text-xl font-semibold tracking-[0.005em]">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      </Panel>
    </div>
  );
}

function createTemplateDraft(template: TemplateDefinition): TemplateDraft {
  if (isSingleDocumentTemplateSlug(template.slug)) {
    const defaultDocumentContent = getTemplateDefaultDocumentContent(template);

    return {
      title: template.name,
      owner: "",
      created: getTodayDateString(),
      lastUpdated: getTodayDateString(),
      fileName: "",
      baseDocumentContent: defaultDocumentContent,
      documentContent: defaultDocumentContent,
      updatedAt: new Date().toISOString(),
      sections: [],
    };
  }

  return {
    title: "",
    owner: "",
    created: getTodayDateString(),
    lastUpdated: getTodayDateString(),
    fileName: "",
    updatedAt: new Date().toISOString(),
    sections: template.sections.map((section) => ({
      id: section.id,
      baseTitle: section.title,
      title: section.title,
      baseHelpText: section.helpText,
      helpText: section.helpText,
      baseContent: section.starter,
      content: section.starter,
    })),
  };
}

function createCodeReviewDraft(): CodeReviewDraft {
  return {
    title: "",
    owner: "",
    lastChecked: getTodayDateString(),
    fileName: "",
    reviewScopePrompt: CODE_REVIEW_SCOPE_PROMPT_DEFAULT,
    updatedAt: new Date().toISOString(),
    sections: codeReviewSections.map((section) => ({
      id: section.id,
      baseTitle: section.title.toUpperCase(),
      title: section.title.toUpperCase(),
      checklist: section.checklist,
      findings: "",
      checked: false,
    })),
  };
}

function createVibeCodingStepDraft(step: VibeCodingStepDefinition): VibeCodingStepDraft {
  return {
    id: step.id,
    baseTitle: step.title,
    title: step.title,
    tool: step.tool,
    goal: step.goal,
    requiredInputs: step.requiredInputs,
    howToUse: step.howToUse,
    artifactLabel: step.artifactLabel,
    artifactPrefix: step.artifactPrefix,
    artifactTemplate: step.artifactTemplate,
    artifactUsedFor: step.artifactUsedFor,
    outputPlaceholder: step.outputPlaceholder,
    basePrompt: step.prompt,
    prompt: step.prompt,
    notes: "",
    completed: false,
  };
}

function createVibeCodingDraft(): VibeCodingDraft {
  return {
    title: "",
    owner: "",
    created: getTodayDateString(),
    lastUpdated: getTodayDateString(),
    kickoffPrompt: VIBE_CODING_CODEX_KICKOFF_PROMPT,
    executionNotes: "",
    steps: vibeCodingSteps.map(createVibeCodingStepDraft),
    updatedAt: new Date().toISOString(),
  };
}

function createHelpDocDraft(doc: LibraryDocument): HelpDocDraft {
  const baseContent = parseHelpDocContent(doc.content);
  return {
    title: doc.title,
    fileName: "",
    baseContent,
    content: baseContent,
    updatedAt: new Date().toISOString(),
  };
}

function normalizeHelpDocDraft(
  doc: LibraryDocument,
  draft?: HelpDocDraft | (Partial<HelpDocDraft> & { sections?: HelpDocSectionDraft[] }),
) {
  if (!draft) {
    return createHelpDocDraft(doc);
  }

  if (typeof draft.content === "string") {
    return {
      title: draft.title ?? doc.title,
      fileName: draft.fileName ?? "",
      baseContent: draft.baseContent ?? parseHelpDocContent(doc.content),
      content: draft.content,
      updatedAt: draft.updatedAt ?? new Date().toISOString(),
    };
  }

  const legacySections =
    "sections" in draft && Array.isArray(draft.sections)
      ? draft.sections
      : parseHelpDocSections(doc.content);
  const baseContent = legacySections
    .map((section) => {
      const body = (section.baseContent ?? "").trim();
      return body ? `## ${section.title}\n\n${body}` : `## ${section.title}`;
    })
    .join("\n\n");
  const content = legacySections
    .map((section) => {
      const body = section.content.trim();
      return body ? `## ${section.title}\n\n${body}` : `## ${section.title}`;
    })
    .join("\n\n");

  return {
    title: doc.title,
    fileName: draft.fileName ?? "",
    baseContent,
    content,
    updatedAt: new Date().toISOString(),
  };
}

function normalizeTemplateDraft(template: TemplateDefinition, draft: TemplateDraft): TemplateDraft {
  if (isSingleDocumentTemplateSlug(template.slug)) {
    const defaultDocumentContent = getTemplateDefaultDocumentContent(template);
    const migratedContentSource =
      typeof draft.documentContent === "string"
        ? draft.documentContent
        : draft.sections.length > 0
          ? draft.sections
              .map((section) => {
                const body = section.content.trim();
                return body ? `## ${section.title}\n\n${body}` : `## ${section.title}`;
              })
              .join("\n\n")
          : defaultDocumentContent;
    return {
      ...draft,
      title: draft.title || template.name,
      owner: draft.owner ?? "",
      created: normalizeDateField(draft.created),
      lastUpdated: normalizeDateField(draft.lastUpdated),
      baseDocumentContent: defaultDocumentContent,
      documentContent: migratedContentSource,
      sections: [],
    };
  }
  const sourceSections =
    draft.sections.length > 0
      ? draft.sections
      : migrateLegacyDocumentContentToSections(template, draft.documentContent);
  const normalizedSourceSections =
    template.slug === "dev-pipeline-master-document"
      ? normalizePipelineTemplateSections(sourceSections)
      : sourceSections;

  return {
    ...draft,
    owner: draft.owner ?? "",
    created: normalizeDateField(draft.created),
    lastUpdated: normalizeDateField(draft.lastUpdated),
    sections: normalizedSourceSections.map((section, index) => {
      const definition = template.sections[index];
      const nextBaseTitle = definition?.title ?? section.baseTitle ?? section.title;
      const previousBaseTitle = section.baseTitle ?? section.title;
      const nextBaseContent = definition?.starter ?? section.baseContent ?? "";
      const previousBaseContent = section.baseContent ?? "";
      const currentTitle = section.title ?? nextBaseTitle;
      const currentContent = section.content ?? nextBaseContent;
      const shouldResetTitle =
        previousBaseTitle.trim() !== nextBaseTitle.trim() &&
        currentTitle.trim() === previousBaseTitle.trim();
      const shouldResetContent =
        previousBaseContent.trim() !== nextBaseContent.trim() &&
        currentContent.trim() === previousBaseContent.trim();

      return {
        ...section,
        baseTitle: nextBaseTitle,
        title: shouldResetTitle ? nextBaseTitle : currentTitle,
        baseHelpText: definition?.helpText ?? section.baseHelpText ?? "",
        helpText:
          section.baseHelpText == null
            ? definition?.helpText ??
              section.helpText ??
              "Use this section for additional project-specific context."
            : section.helpText ??
              definition?.helpText ??
              "Use this section for additional project-specific context.",
        baseContent: nextBaseContent,
        content: shouldResetContent ? nextBaseContent : currentContent,
      };
    }),
  };
}

function normalizeVibeCodingDraft(draft: VibeCodingDraft): VibeCodingDraft {
  const defaultSteps = vibeCodingSteps;
  const sourceSteps = draft.steps.length > 0 ? draft.steps : defaultSteps.map(createVibeCodingStepDraft);

  return {
    ...draft,
    owner: draft.owner ?? "",
    created: normalizeDateField(draft.created),
    lastUpdated: normalizeDateField(draft.lastUpdated),
    kickoffPrompt: draft.kickoffPrompt ?? VIBE_CODING_CODEX_KICKOFF_PROMPT,
    executionNotes: draft.executionNotes ?? "",
    steps: sourceSteps.map((step, index) => {
      const definition = defaultSteps[index];
      const nextBaseTitle = definition?.title ?? step.baseTitle ?? step.title;
      const previousBaseTitle = step.baseTitle ?? step.title ?? nextBaseTitle;
      const currentTitle = step.title ?? nextBaseTitle;
      const shouldResetTitle =
        previousBaseTitle.trim() !== nextBaseTitle.trim() &&
        currentTitle.trim() === previousBaseTitle.trim();
      const nextBasePrompt = definition?.prompt ?? step.basePrompt ?? step.prompt;
      const previousBasePrompt = step.basePrompt ?? step.prompt ?? "";
      const currentPrompt = step.prompt ?? nextBasePrompt;
      const shouldResetPrompt =
        previousBasePrompt.trim() !== nextBasePrompt.trim() &&
        currentPrompt.trim() === previousBasePrompt.trim();

      return {
        id: step.id,
        baseTitle: nextBaseTitle,
        title: shouldResetTitle ? nextBaseTitle : currentTitle,
        tool: definition?.tool ?? step.tool ?? "ChatGPT",
        goal: definition?.goal ?? step.goal ?? "",
        requiredInputs: definition?.requiredInputs ?? step.requiredInputs ?? [],
        howToUse: definition?.howToUse ?? step.howToUse ?? [],
        artifactLabel: definition?.artifactLabel ?? step.artifactLabel ?? "Artifact",
        artifactPrefix: definition?.artifactPrefix ?? step.artifactPrefix ?? "artifact",
        artifactTemplate: definition?.artifactTemplate ?? step.artifactTemplate ?? "[project-name]-artifact.md",
        artifactUsedFor: definition?.artifactUsedFor ?? step.artifactUsedFor ?? "Use this in the next step.",
        outputPlaceholder:
          definition?.outputPlaceholder ??
          step.outputPlaceholder ??
          "[Paste the actual result of this step here]",
        basePrompt: nextBasePrompt,
        prompt: shouldResetPrompt ? nextBasePrompt : currentPrompt,
        notes: step.notes ?? "",
        completed: step.completed ?? false,
      };
    }),
  };
}

function normalizeCodeReviewDraft(draft: CodeReviewDraft): CodeReviewDraft {
  return {
    ...draft,
    owner: draft.owner ?? "",
    lastChecked: normalizeDateField(draft.lastChecked),
    reviewScopePrompt: draft.reviewScopePrompt ?? CODE_REVIEW_SCOPE_PROMPT_DEFAULT,
    sections: draft.sections.map((section, index) => {
      const nextBaseTitle = (
        codeReviewSections[index]?.title ??
        `Review section ${index + 1}`
      ).toUpperCase();
      const previousBaseTitle = section.baseTitle ?? section.title ?? nextBaseTitle;
      const currentTitle = (section.title ?? previousBaseTitle).toUpperCase();
      const shouldResetTitle =
        previousBaseTitle.trim() !== nextBaseTitle.trim() &&
        currentTitle.trim() === previousBaseTitle.trim();

      return {
        id: section.id,
        baseTitle: nextBaseTitle,
        title: shouldResetTitle ? nextBaseTitle : currentTitle,
        checklist:
          ("checklist" in section && typeof section.checklist === "string"
            ? section.checklist
            : "prompts" in section && Array.isArray(section.prompts)
              ? section.prompts.join("\n")
              : undefined) ?? codeReviewSections[index]?.checklist ?? "",
        findings: section.findings ?? "",
        checked: "checked" in section && typeof section.checked === "boolean" ? section.checked : false,
      };
    }),
  };
}

function parseHelpDocSections(content: string): HelpDocSectionDraft[] {
  const lines = content.split("\n");
  const sections: HelpDocSectionDraft[] = [];
  let currentTitle = "Overview";
  let currentLines: string[] = [];

  lines.forEach((line) => {
    if (/^#\s+/.test(line)) {
      return;
    }

    const heading = line.match(/^##\s+(.+)$/);
    if (heading) {
      const body = currentLines.join("\n").trim();
      if (body || sections.length > 0 || currentTitle !== "Overview") {
        sections.push({
          id: createDraftSectionId("help-section"),
          title: currentTitle,
          baseContent: body,
          content: body,
        });
      }
      currentTitle = heading[1].trim();
      currentLines = [];
      return;
    }

    currentLines.push(line);
  });

  const finalBody = currentLines.join("\n").trim();
  if (finalBody || sections.length === 0) {
    sections.push({
      id: createDraftSectionId("help-section"),
      title: currentTitle,
      baseContent: finalBody,
      content: finalBody,
    });
  }

  return sections;
}

function parseHelpDocContent(content: string) {
  return content
    .split("\n")
    .filter((line) => !/^#\s+/.test(line))
    .join("\n")
    .trim();
}

function isSingleDocumentTemplateSlug(slug: string) {
  return slug === "readme-md";
}

function isRawMarkdownTemplateSlug(slug: string) {
  return slug === "readme-md";
}

function getTemplateDefaultDocumentContent(template: TemplateDefinition) {
  if (template.slug === "readme-md") {
    return README_DEFAULT_DOCUMENT;
  }

  return "";
}

function stripSingleDocumentEditorMarkdown(content: string) {
  return content
    .split("\n")
    .filter((line) => line.trim() !== "---")
    .map((line) => line.replace(/^#{1,6}\s+/, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getTodayDateString() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeDateField(value?: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value ?? "") ? value ?? "" : getTodayDateString();
}

function createTemplateMetaLines(template: TemplateDefinition, draft: TemplateDraft) {
  return [
    `Document: ${template.name}`,
    `Owner: ${draft.owner.trim() || "N/A"}`,
    `Created: ${normalizeDateField(draft.created)}`,
    `Last updated: ${normalizeDateField(draft.lastUpdated)}`,
  ];
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function createStructuredTemplateSectionId(title: string, index: number) {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || `template-section-${index + 1}`
  );
}

function trimStructuredSectionLines(lines: string[]) {
  const nextLines = [...lines];

  while (nextLines[0]?.trim() === "") {
    nextLines.shift();
  }

  while (nextLines[nextLines.length - 1]?.trim() === "") {
    nextLines.pop();
  }

  return nextLines;
}

function getStructuredTemplateHeadingTitle(template: TemplateDefinition, line: string) {
  const trimmed = line.trim();

  if (template.slug === "dev-pipeline-master-document") {
    if (
      /^PHASE\s+\d+\s+—\s+/.test(trimmed) ||
      trimmed === "PIPELINE RULES" ||
      trimmed === "MINIMUM SUCCESS STATE"
    ) {
      return trimmed;
    }
  }

  if (template.slug === "requirements-specification") {
    if (/^\d+\.\s+/.test(trimmed)) {
      return trimmed;
    }
  }

  if (template.slug === "roadmap") {
    const match = trimmed.match(/^##\s+(.+)$/);
    if (match) {
      return match[1];
    }
  }

  return null;
}

function getStructuredTemplatePrefaceTitle(template: TemplateDefinition) {
  if (template.slug === "dev-pipeline-master-document") {
    return "Overview";
  }

  if (template.slug === "roadmap") {
    return "Introduction";
  }

  return "";
}

function getDefaultTemplateSections(template: TemplateDefinition): TemplateDraftSection[] {
  return template.sections.map((section) => ({
    id: section.id,
    baseTitle: section.title,
    title: section.title,
    baseHelpText: section.helpText,
    helpText: section.helpText,
    baseContent: section.starter,
    content: section.starter,
  }));
}

function stripDuplicateLeadingSectionHeading(title: string, content: string) {
  const lines = content.split("\n");
  const firstMeaningfulIndex = lines.findIndex((line) => line.trim() !== "");

  if (firstMeaningfulIndex === -1) {
    return content;
  }

  const firstMeaningfulLine = lines[firstMeaningfulIndex].trim();
  const headingPattern = new RegExp(`^(?:##\\s+)?${escapeRegExp(title.trim())}$`);

  if (!headingPattern.test(firstMeaningfulLine)) {
    return content;
  }

  const nextLines = [...lines];
  nextLines.splice(firstMeaningfulIndex, 1);

  if (nextLines[firstMeaningfulIndex]?.trim() === "") {
    nextLines.splice(firstMeaningfulIndex, 1);
  }

  return nextLines.join("\n").trim();
}

function normalizePipelineTemplateSections(sections: TemplateDraftSection[]) {
  return sections
    .filter((section) => section.title.trim().toLowerCase() !== "overview")
    .map((section) => ({
      ...section,
      content: stripDuplicateLeadingSectionHeading(section.title, section.content),
      baseContent: stripDuplicateLeadingSectionHeading(section.title, section.baseContent),
    }));
}

function migrateLegacyDocumentContentToSections(
  template: TemplateDefinition,
  documentContent?: string,
): TemplateDraftSection[] {
  if (!documentContent?.trim()) {
    return getDefaultTemplateSections(template);
  }

  if (
    template.slug !== "dev-pipeline-master-document" &&
    template.slug !== "requirements-specification" &&
    template.slug !== "roadmap"
  ) {
    return getDefaultTemplateSections(template);
  }

  const sections: TemplateDraftSection[] = [];
  const lines = documentContent.split("\n");
  let currentTitle = getStructuredTemplatePrefaceTitle(template);
  let currentLines: string[] = [];

  function pushCurrent() {
    const trimmedLines = trimStructuredSectionLines(currentLines).filter((line) => line.trim() !== "⸻");
    if (!currentTitle && trimmedLines.length === 0) {
      currentLines = [];
      return;
    }

    const content = trimmedLines.join("\n");
    sections.push({
      id: createStructuredTemplateSectionId(currentTitle || `Section ${sections.length + 1}`, sections.length),
      baseTitle: currentTitle || `Section ${sections.length + 1}`,
      title: currentTitle || `Section ${sections.length + 1}`,
      baseHelpText: "",
      helpText: "",
      baseContent: content,
      content,
    });
    currentLines = [];
  }

  lines.forEach((line) => {
    const headingTitle = getStructuredTemplateHeadingTitle(template, line);

    if (headingTitle) {
      if (currentTitle || trimStructuredSectionLines(currentLines).length > 0) {
        pushCurrent();
      }
      currentTitle = headingTitle;
      return;
    }

    if (line.trim() === "⸻") {
      return;
    }

    currentLines.push(line);
  });

  if (currentTitle || trimStructuredSectionLines(currentLines).length > 0) {
    pushCurrent();
  }

  return sections.length > 0 ? sections : getDefaultTemplateSections(template);
}

function createCodeReviewMetaLines(draft: CodeReviewDraft) {
  return [
    "Document: Code Review",
    `Owner: ${draft.owner.trim() || "N/A"}`,
    `Review date: ${normalizeDateField(draft.lastChecked)}`,
  ];
}

function createVibeCodingMetaLines(draft: VibeCodingDraft) {
  return [
    "Document: Shipkit Build System",
    `Owner: ${draft.owner.trim() || "N/A"}`,
    `Created: ${normalizeDateField(draft.created)}`,
    `Last updated: ${normalizeDateField(draft.lastUpdated)}`,
  ];
}

function getVibeCodingStepDocumentLabel(step: Pick<VibeCodingStepDraft, "id" | "title">) {
  if (step.id === "deep-research") {
    return "Deep Research";
  }
  if (step.id === "prd-mvp") {
    return "PRD";
  }
  if (step.id === "tech-design-mvp") {
    return "Tech Design";
  }
  if (step.id === "notes-for-agent") {
    return "Codex Setup";
  }

  return step.title.replace(/^Part\s+\d+\s+—\s+/, "").trim() || step.title;
}

function buildTemplateFileName(template: TemplateDefinition, projectName: string) {
  if (template.slug === "readme-md") {
    return "README";
  }

  if (template.slug === "roadmap") {
    const projectSlug = slugify(projectName);
    return projectSlug ? `${projectSlug}-roadmap` : "roadmap";
  }

  const prefix = slugify(projectName) || getTemplateDefaultProjectPrefix(template);
  const lockedSuffix = getTemplateLockedSuffix(template);
  return `${prefix}-${lockedSuffix}`;
}

function getTemplateDefaultProjectPrefix(template: TemplateDefinition) {
  return "dev";
}

function getTemplateLockedSuffix(template: TemplateDefinition) {
  if (template.slug === "build-plan") {
    return "build-plan";
  }

  if (template.slug === "dev-pipeline-master-document") {
    return "pipeline-master-document";
  }

  if (template.slug === "requirements-specification") {
    return "requirements-specification";
  }

  return "master-project-document";
}

function buildCodeReviewFileName(projectName: string) {
  const projectSlug = slugify(projectName);
  const prefix = projectSlug ? `${projectSlug}-code-review` : "code-review";
  return prefix;
}

function buildHelpDocFileName(title: string, fallback: string) {
  return slugify(title) || fallback;
}

function buildVibeCodingFileName(projectName: string) {
  const projectSlug = slugify(projectName);
  const prefix = projectSlug ? `${projectSlug}-shipkit-build-system` : "shipkit-build-system";
  return prefix;
}

function buildVibeCodingArtifactFileName(step: Pick<VibeCodingStepDraft, "artifactPrefix">, projectName: string) {
  const projectSlug = slugify(projectName);
  return projectSlug ? `${projectSlug}-${step.artifactPrefix}.md` : `${step.artifactPrefix}.md`;
}

function getVibeCodingArtifactMarkdown(step: VibeCodingStepDraft, draft: VibeCodingDraft) {
  const documentLabel = getVibeCodingStepDocumentLabel(step);

  return formatMarkdownDocument(documentLabel, step.notes.trim() || step.outputPlaceholder, [
    `Project: ${draft.title.trim() || "Untitled project"}`,
    `Document: ${documentLabel}`,
    `Owner: ${draft.owner.trim() || "N/A"}`,
    `Created: ${normalizeDateField(draft.created)}`,
    `Last updated: ${normalizeDateField(draft.lastUpdated)}`,
  ]);
}

function generateHelpDocMarkdown(title: string, content: string) {
  return [`# ${title}`, "", content.trim() || "Pending content."].join("\n");
}

function generateVibeCodingMarkdown(
  title: string,
  draft: VibeCodingDraft,
  metaLines: string[] = [],
) {
  const body = getVibeCodingExportSections(draft)
    .flatMap((section) => [`## ${section.title}`, "", section.body.trim(), ""])
    .join("\n")
    .trim();

  return formatMarkdownDocument(title, body, metaLines);
}

function getHelpDocCategory(doc: FrameworkDocument): Exclude<HelpDocFilter, "all"> {
  if (doc.slug === "ai-critique-prompt") {
    return "ai";
  }

  return "product";
}

function getHelpDocCategoryLabel(doc: FrameworkDocument) {
  return getHelpDocCategory(doc) === "ai" ? "AI" : "Product";
}

function getCourseCategory(doc: CourseDocument): Exclude<CourseFilter, "all"> {
  if (doc.slug === "frontend-learning-prompt") {
    return "frontend";
  }

  if (doc.slug === "product-management-learning-prompt") {
    return "product";
  }

  return "security";
}

function getCourseCategoryLabel(doc: CourseDocument) {
  const category = getCourseCategory(doc);

  if (category === "frontend") {
    return "Frontend";
  }

  if (category === "product") {
    return "Product";
  }

  return "Security";
}

function createDraftSectionId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function useSystemTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") {
      return "dark";
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function updateTheme(event: MediaQueryListEvent | MediaQueryList) {
      setTheme(event.matches ? "dark" : "light");
    }

    updateTheme(mediaQuery);
    mediaQuery.addEventListener("change", updateTheme);

    return () => {
      mediaQuery.removeEventListener("change", updateTheme);
    };
  }, []);

  return theme;
}

function usePersistentState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        return JSON.parse(raw) as T;
      }
    } catch {
      // Ignore malformed local storage state.
    }

    return initialValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState] as const;
}

function generateTemplateMarkdown(
  title: string,
  sections: TemplateDraftSection[],
  metaLines: string[] = [],
) {
  const body = sections
    .flatMap((section) => [`## ${section.title}`, "", section.content.trim(), ""])
    .join("\n")
    .trim();

  return formatMarkdownDocument(title, body, metaLines);
}

function generatePipelineMarkdown(title: string, content: string, metaLines: string[] = []) {
  return formatMarkdownDocument(title, formatSingleDocumentMarkdown(content), metaLines);
}

function formatMarkdownDocument(title: string, body: string, metaLines: string[] = []) {
  const normalizedBody = body.trim() || "Pending content.";

  return [
    `# ${title}`,
    "",
    ...(metaLines.length > 0
      ? [
          "## Metadata",
          "",
          ...metaLines.map((line) => `- **${line.split(":")[0]}:** ${line.split(":").slice(1).join(":").trim()}`),
          "",
          "---",
          "",
        ]
      : []),
    normalizedBody,
  ].join("\n");
}

function formatSingleDocumentMarkdown(content: string) {
  const subheadings = new Set([
    "Purpose:",
    "Rule:",
    "Goal:",
    "Input:",
    "Output:",
    "Do NOT:",
    "Status:",
    "Must clarify:",
    "Stop condition:",
    "Method:",
    "You fill in:",
    "Prompt:",
    "Instruction:",
    "After this phase:",
    "Create:",
    "Must ensure:",
    "Rules:",
    "After each major step:",
    "Review for:",
    "In Scope",
    "Out of Scope",
    "Primary Flow",
    "Alternative Flows",
    "System Behavior",
    "Unit Tests",
    "Integration Tests",
    "Manual Testing",
  ]);

  return content
    .split("\n")
    .map((rawLine) => {
      const line = rawLine.trimEnd();
      const trimmed = line.trim();

      if (!trimmed || trimmed === "⸻" || trimmed === "---") {
        return trimmed === "⸻" || trimmed === "---" ? "" : line;
      }

      if (/^#{1,6}\s+/.test(trimmed)) {
        return line;
      }

      if (/^PHASE\s+\d+\s+—\s+/.test(trimmed) || /^\d+\.\s+\S/.test(trimmed)) {
        return `## ${trimmed}`;
      }

      if (trimmed === "PIPELINE RULES" || trimmed === "MINIMUM SUCCESS STATE") {
        return `## ${trimmed}`;
      }

      if (subheadings.has(trimmed)) {
        return `### ${trimmed}`;
      }

      return line;
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function generateCodeReviewMarkdown(
  title: string,
  sections: CodeReviewSectionDraft[],
  metaLines: string[] = [],
) {
  const body = sections
    .flatMap((section) => [
      `## ${section.title}`,
      "",
      section.findings.trim(),
      "",
    ])
    .join("\n")
    .trim();

  return formatMarkdownDocument(title, body, metaLines);
}

function createCodeReviewSectionExport(section: CodeReviewSectionDraft) {
  return section.findings.trim();
}

function getSingleDocumentContent(template: TemplateDefinition, draft: TemplateDraft) {
  return draft.documentContent ?? getTemplateDefaultDocumentContent(template);
}

function getTemplateExportSections(template: TemplateDefinition, draft: TemplateDraft): ExportSection[] {
  if (isSingleDocumentTemplateSlug(template.slug)) {
    return [
      {
        title: "",
        body: getSingleDocumentContent(template, draft),
      },
    ];
  }

  const sections = draft.sections.map((section) => ({
    title: section.title,
    body: section.content,
  }));

  return sections;
}

function getTemplateExportMarkdown(
  template: TemplateDefinition,
  draft: TemplateDraft,
  title: string,
  metaLines: string[] = [],
) {
  if (isSingleDocumentTemplateSlug(template.slug)) {
    const content = getSingleDocumentContent(template, draft);
    return isRawMarkdownTemplateSlug(template.slug)
      ? content.trim()
      : generatePipelineMarkdown(title, content, metaLines);
  }

  return generateTemplateMarkdown(title, draft.sections, metaLines);
}

function getCodeReviewExportSections(draft: CodeReviewDraft): ExportSection[] {
  return draft.sections.map((section) => ({
    title: section.title,
    body: createCodeReviewSectionExport(section),
  }));
}

function getVibeCodingExportSections(draft: VibeCodingDraft): ExportSection[] {
  const stepSections = draft.steps.map((step) => ({
    title: step.title,
    body: step.notes.trim() || step.outputPlaceholder,
  }));

  return [
    ...stepSections,
  ];
}

function getVibeCodingExportMarkdown(draft: VibeCodingDraft, title: string) {
  return generateVibeCodingMarkdown(title, draft, createVibeCodingMetaLines(draft));
}

function getTemplateLens(template: TemplateDefinition): Exclude<TemplateFilter, "all"> {
  if (template.category === "pipeline") {
    return "pipeline";
  }

  return "development";
}

function getTemplateLensLabel(template: TemplateDefinition) {
  const lens = getTemplateLens(template);

  if (lens === "pipeline") {
    return "Pipeline";
  }

  return "Development";
}

function CopyPromptField({
  label,
  prompt,
  buttonLabel = "Copy",
  textareaHeight,
}: {
  label: string;
  prompt: string;
  buttonLabel?: string;
  textareaHeight?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      downloadTextFile("copied-prompt.txt", prompt);
    }
  }

  return (
    <Field label={label}>
      <div className="space-y-2">
        <Textarea value={prompt} readOnly className={`${textareaHeight ?? "min-h-[220px]"} text-sm leading-7`} rows={8} />
        <Button variant="secondary" onClick={handleCopy}>
          <Copy className="size-4" />
          {copied ? "Copied" : buttonLabel}
        </Button>
      </div>
    </Field>
  );
}

function CopyableEditableTextareaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 8,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      downloadTextFile("copied-field.txt", value);
    }
  }

  return (
    <Field label={label}>
      <div className="space-y-2">
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={className}
        />
        <Button variant="secondary" onClick={handleCopy}>
          <Copy className="size-4" />
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
    </Field>
  );
}

function splitTextBlocks(text: string, emptyText = "Pending content.") {
  const trimmed = text.trim();

  if (!trimmed) {
    return emptyText ? [{ type: "p" as const, lines: [emptyText] }] : [];
  }

  return trimmed.split(/\n{2,}/).map((block) => {
    const lines = block.split("\n").filter(Boolean);

    if (lines.length === 1 && lines[0].trim() === "⸻") {
      return { type: "separator" as const, lines: [] };
    }

    if (lines.length === 1 && lines[0].trim() === "---") {
      return { type: "separator" as const, lines: [] };
    }

    if (lines.length === 1 && /^#{1,6}\s+/.test(lines[0].trim())) {
      return {
        type: "heading" as const,
        lines: [lines[0].trim().replace(/^#{1,6}\s+/, "")],
      };
    }

    if (lines.length === 1 && /^\d+\.\s+\S/.test(lines[0].trim())) {
      return { type: "heading" as const, lines: [lines[0].trim()] };
    }

    if (
      lines.length === 1 &&
      /^(PHASE\s+\d+\s+—\s+|PIPELINE RULES$|MINIMUM SUCCESS STATE$)/.test(lines[0].trim())
    ) {
      return { type: "heading" as const, lines: [lines[0].trim()] };
    }

    if (lines.every((line) => /^[-*]\s+/.test(line.trim()))) {
      return {
        type: "ul" as const,
        lines: lines.map((line) => line.replace(/^[-*]\s+/, "")),
      };
    }

    if (lines.every((line) => /^\d+\.\s+/.test(line.trim()))) {
      return {
        type: "ol" as const,
        lines: lines.map((line) => line.replace(/^\d+\.\s+/, "")),
      };
    }

    return { type: "p" as const, lines };
  });
}

function getEditorTextAreaClass(fontScale: EditorFontScale) {
  if (fontScale === "sm") {
    return "text-sm leading-6";
  }

  if (fontScale === "lg") {
    return "text-lg leading-8";
  }

  return "text-base leading-7";
}

function getPreviewTextClass(fontScale: EditorFontScale) {
  if (fontScale === "sm") {
    return "text-sm leading-7";
  }

  if (fontScale === "lg") {
    return "text-lg leading-9";
  }

  return "text-base leading-8";
}

export default App;
