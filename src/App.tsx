import type { ReactNode } from "react";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
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
  codeReviewSections,
  helpDocuments,
  templates,
  type HelpDocument,
  type TemplateDefinition,
} from "@/data/documents";
import {
  downloadTextFile,
  exportPdfDocument,
  slugify,
  type ExportSection,
} from "@/lib/utils";

type TemplateDraftSection = {
  id: string;
  title: string;
  helpText: string;
  baseContent: string;
  content: string;
};

type TemplateDraft = {
  title: string;
  fileName: string;
  sections: TemplateDraftSection[];
  updatedAt: string;
};

type CodeReviewSectionDraft = {
  id: string;
  title: string;
  prompts: string[];
  checked: boolean;
  notes: string;
  findings: string;
  severity: "" | "critical" | "high" | "medium" | "low";
  needsVerification: boolean;
};

type CodeReviewDraft = {
  title: string;
  fileName: string;
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
type TemplateFilter = "all" | "general" | "development" | "pipeline";

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
          <Route path="/" element={<Navigate to="/templates" replace />} />
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
            path="/help"
            element={<HelpDocsLibrary helpDocDrafts={helpDocDrafts} onChange={setHelpDocDrafts} />}
          />
          <Route path="/help/:docSlug" element={<Navigate to="/help" replace />} />
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
    <aside className="sidebar-shell sticky top-0 h-screen border-r border-border px-5 py-6">
      <div className="space-y-5">
        <div className="surface p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/8 bg-[#212121] text-lg font-medium text-accent shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
                S
              </div>
              <div className="min-w-0">
                <h1 className="text-[1.7rem] leading-none font-semibold tracking-[0.01em] text-gradient">
                  Shipkit
                </h1>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onCollapse}>
              <PanelLeftClose className="size-4" />
            </Button>
          </div>
          <p className="mt-4 max-w-sm text-[0.98rem] leading-7 text-muted-foreground">
            Open a template in the app, shape it into a project-specific document, and export
            it as clean Markdown or PDF.
          </p>
        </div>

        <div className="surface-subtle p-2.5">
          <nav className="space-y-1.5">
            <SidebarLink
              to="/templates"
              icon={<FolderKanban className="size-4" />}
              title="Templates"
              description="Universal, Dev, and Pipeline docs"
            />
            <SidebarLink
              to="/code-review"
              icon={<ClipboardCheck className="size-4" />}
              title="Code Review"
              description="Code Review Checklist"
            />
            <SidebarLink
              to="/help"
              icon={<BookOpen className="size-4" />}
              title="Help Docs"
              description="AI input + product checklists"
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
    </aside>
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
              { value: "general", label: "General" },
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
            ? countCustomizedTemplateSections(normalizeTemplateDraft(template, draft))
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
  const deferredDraft = useDeferredValue(draft);
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
  const resolvedTitle = draft.title.trim() || activeTemplate.name;
  const resolvedFileName = buildTemplateFileName(activeTemplate, draft.title);
  const markdown = generateTemplateMarkdown(resolvedTitle, draft.sections);

  function updateDraft(updater: (current: TemplateDraft) => TemplateDraft) {
    onChange((current) => {
      const base = normalizeTemplateDraft(
        activeTemplate,
        current[activeTemplate.slug] ?? createTemplateDraft(activeTemplate),
      );
      const next = updater(base);
      return {
        ...current,
        [activeTemplate.slug]: {
          ...next,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  }

  function handleExportMarkdown() {
    downloadTextFile(`${resolvedFileName}.md`, markdown);
  }

  function handleExportPdf() {
    exportPdfDocument(
      resolvedFileName,
      resolvedTitle,
      draft.sections.map((section) => ({
        title: section.title,
        body: section.content,
      })),
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
          title: `New section ${current.sections.length + 1}`,
          helpText: "Use this section for project-specific content that does not fit the base template.",
          baseContent: "",
          content: "",
        },
      ],
    }));
  }

  const dockedSections = draft.sections.filter(
    (section) => !isFloating(`template-section-${section.id}`),
  );
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
                updateDraft((current) => ({
                  ...current,
                  sections: current.sections.map((item) =>
                    item.id === section.id ? { ...item, title } : item,
                  ),
                })),
              onChange: (content) =>
                updateDraft((current) => ({
                  ...current,
                  sections: current.sections.map((item) =>
                    item.id === section.id ? { ...item, content } : item,
                  ),
                })),
            })}
            {index < draft.sections.length - 1 ? <div className="soft-divider" /> : null}
          </section>
        );
      })}
    </div>
  );

  const floatingPanels = [
    {
      id: "template-sections",
      title: "Sections",
      content: renderTemplateSectionsNav({
        draft,
        onAdd: addTemplateSection,
        onJump: handleJumpToSection,
      }),
    },
    {
      id: "template-preview",
      title: "Live Preview",
      content: (
        <DocumentPreview
          title={resolvedTitle}
          sections={deferredDraft.sections.map((section) => ({
            title: section.title,
            body: section.content,
          }))}
          fontScale={fontScale}
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
          updateDraft((current) => ({
            ...current,
            sections: current.sections.map((item) =>
              item.id === section.id ? { ...item, title } : item,
            ),
          })),
        onChange: (content) =>
          updateDraft((current) => ({
            ...current,
            sections: current.sections.map((item) =>
              item.id === section.id ? { ...item, content } : item,
            ),
          })),
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
              })}
            </div>
          </Panel>
        ) : null}

        <div className="space-y-4">
          <Panel>
            <div className="flex flex-col gap-3">
              <div className="mono-label">Workflow guidance</div>
              <div className="grid gap-3 md:grid-cols-3">
                {activeTemplate.overview.map((item) => (
                  <div key={item} className="surface-subtle stagger-enter px-4 py-3 text-sm leading-6 text-foreground-soft">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </Panel>

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
                      onChange: (content) =>
                        updateDraft((current) => ({
                          ...current,
                          sections: current.sections.map((item) =>
                            item.id === section.id ? { ...item, content } : item,
                          ),
                        })),
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
                hint="Used for project-specific document naming. Leave empty to keep the template default."
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
                  sections={deferredDraft.sections.map((section) => ({
                    title: section.title,
                    body: section.content,
                  }))}
                  fontScale={fontScale}
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
  const deferredDraft = useDeferredValue(normalizedDraft);
  const panelIds = useMemo(
    () => [
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
  const markdown = generateCodeReviewMarkdown(resolvedTitle, normalizedDraft.sections);
  const completedCount = normalizedDraft.sections.filter((section) => section.checked).length;

  function updateSection(
    sectionId: string,
    updater: (current: CodeReviewSectionDraft) => CodeReviewSectionDraft,
  ) {
    onChange((current) => {
      const normalizedCurrent = normalizeCodeReviewDraft(current);

      return {
        ...normalizedCurrent,
        updatedAt: new Date().toISOString(),
        sections: normalizedCurrent.sections.map((section) =>
          section.id === sectionId ? updater(section) : section,
        ),
      };
    });
  }

  function addCodeReviewSection() {
    onChange((current) => {
      const normalizedCurrent = normalizeCodeReviewDraft(current);

      return {
        ...normalizedCurrent,
        updatedAt: new Date().toISOString(),
        sections: [
          ...normalizedCurrent.sections,
          {
            id: createDraftSectionId("review-section"),
            title: `New review section ${normalizedCurrent.sections.length + 1}`,
            prompts: [],
            checked: false,
            notes: "",
            findings: "",
            severity: "",
            needsVerification: false,
          },
        ],
      };
    });
  }

  function handleExportMarkdown() {
    downloadTextFile(`${resolvedFileName}.md`, markdown);
  }

  function handleExportPdf() {
    exportPdfDocument(
      resolvedFileName,
      resolvedTitle,
      normalizedDraft.sections.map((section) => ({
        title: section.title,
        body: createCodeReviewSectionExport(section),
      })),
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
              <div className="flex items-center gap-2">
                <StatusPill tone={section.checked ? "success" : "default"}>
                  {section.checked ? "Checked" : "Open"}
                </StatusPill>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => floatPanel(`review-section-${section.id}`)}
                >
                  <PinOff className="size-3.5" />
                  Float
                </Button>
              </div>
            </div>
            {renderCodeReviewSectionEditor({
              section,
              fontScale,
              displayMode: "inline",
              onChange: updateSection,
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
      id: "review-sections",
      title: "Sections",
      content: renderCodeReviewSectionsNav({
        draft: normalizedDraft,
        onAdd: addCodeReviewSection,
        onJump: handleJumpToSection,
      }),
    },
    {
      id: "review-preview",
      title: "Live Preview",
      content: (
        <DocumentPreview
          title={resolvedTitle}
          sections={deferredDraft.sections.map((section) => ({
            title: section.title,
            body: createCodeReviewSectionExport(section),
          }))}
          fontScale={fontScale}
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
              subtitle={`${completedCount}/${normalizedDraft.sections.length} checked`}
              onDetach={() => floatPanel("review-sections")}
            />
            <div className="scroll-panel mt-4">
              {renderCodeReviewSectionsNav({
                draft: normalizedDraft,
                onAdd: addCodeReviewSection,
                onJump: handleJumpToSection,
              })}
            </div>
          </Panel>
        ) : null}

        <div className="space-y-4">
          {layoutMode === "single" && !isFloating("review-document") ? (
            <Panel className="stagger-enter">
              <DockedPanelHeader
                title="Review document"
                subtitle={`${normalizedDraft.sections.length} sections in one editor`}
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
                    subtitle="Checklist section"
                    onDetach={() => floatPanel(`review-section-${section.id}`)}
                    status={
                      <StatusPill tone={section.checked ? "success" : "default"}>
                        {section.checked ? "Checked" : "Open"}
                      </StatusPill>
                    }
                  />
                  <div className="mt-4">
                    {renderCodeReviewSectionEditor({
                      section,
                      fontScale,
                      displayMode: "panel",
                      onChange: updateSection,
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
                    onChange((current) => ({
                      ...current,
                      title: event.target.value,
                      updatedAt: new Date().toISOString(),
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
                <Button variant="ghost" onClick={() => onChange(createCodeReviewDraft())}>
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
                  sections={deferredDraft.sections.map((section) => ({
                    title: section.title,
                    body: createCodeReviewSectionExport(section),
                  }))}
                  fontScale={fontScale}
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

function HelpDocsLibrary({
  helpDocDrafts,
  onChange,
}: {
  helpDocDrafts: Record<string, HelpDocDraft>;
  onChange: React.Dispatch<React.SetStateAction<Record<string, HelpDocDraft>>>;
}) {
  const [filter, setFilter] = useState<HelpDocFilter>("all");
  const [activeDocSlug, setActiveDocSlug] = useState<string | null>(null);
  const filteredDocs = helpDocuments.filter((doc) => {
    if (filter === "all") {
      return true;
    }

    return getHelpDocCategory(doc) === filter;
  });
  const activeHelpDoc = helpDocuments.find((doc) => doc.slug === activeDocSlug) ?? null;

  return (
    <div className="page-frame mx-auto flex max-w-[1450px] flex-col gap-6 px-4 py-6 md:px-6">
      <PageIntro
        eyebrow="Help docs"
        title="Help Docs"
        description="Open the right reference document, shape it in the app, and export a clean final Markdown or PDF artifact."
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
            label="Visible help docs"
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
                    Open help doc
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

function HelpDocFloatingCard({
  doc,
  draft,
  onChange,
  onClose,
}: {
  doc: HelpDocument;
  draft: HelpDocDraft;
  onChange: (updater: (current: HelpDocDraft) => HelpDocDraft) => void;
  onClose: () => void;
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
        className="floating-window"
        style={{
          left: "50%",
          top: 24,
          transform: "translateX(-50%)",
          width: "min(980px, calc(100vw - 32px))",
          height: "min(86vh, 920px)",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="floating-window-header">
          <div className="min-w-0">
            <div className="mono-label">Help doc</div>
            <div className="truncate text-sm font-medium text-foreground">{doc.title}</div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleCopyContents}>
              <Copy className="size-4" />
              {copied ? "Copied" : "Copy contents"}
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="size-4" />
            </Button>
          </div>
        </div>

        <div className="floating-window-body">
          <div className="mx-auto max-w-4xl space-y-6 py-2">
            <div className="space-y-3">
              <div className="mono-label">Headline</div>
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
}: {
  draft: TemplateDraft;
  onAdd?: () => void;
  onJump?: (sectionId: string) => void;
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
          <button
            key={section.id}
            type="button"
            onClick={() => onJump?.(section.id)}
            className="flex w-full items-center justify-between gap-3 rounded-[18px] border border-transparent px-3 py-2.5 text-left transition-colors hover:bg-[color:var(--chrome-soft)]"
          >
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-foreground">{section.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Section {index + 1}
              </div>
            </div>
            {status.label ? <StatusPill tone={status.tone}>{status.label}</StatusPill> : null}
          </button>
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
  onChange,
}: {
  draftSection: TemplateDraftSection;
  sectionIndex: number;
  fontScale: EditorFontScale;
  displayMode: "panel" | "inline";
  onTitleChange: (title: string) => void;
  onChange: (content: string) => void;
}) {
  return (
    <div className="space-y-4">
      {displayMode === "panel" ? (
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
          <div className="surface-subtle px-4 py-3">
            <div className="mono-label">Section brief</div>
            <p className="mt-2 text-sm leading-6 text-foreground-soft">
              {draftSection.helpText || "Use this section for additional project-specific context."}
            </p>
          </div>
          <div className="surface-subtle px-4 py-3">
            <div className="mono-label">Editing mode</div>
            <div className="mt-2 text-sm text-foreground-soft">Structured document block</div>
            <div className="mt-1 text-xs leading-5 text-muted-foreground">
              Use bullets or short paragraphs. Keep this section concrete and project-specific.
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="mono-label">Section brief</div>
          <p className="max-w-3xl text-sm leading-6 text-foreground-soft">
            {draftSection.helpText || "Use this section for additional project-specific context."}
          </p>
        </div>
      )}
      <Field label={`Section ${sectionIndex + 1}`}>
        <Input
          value={draftSection.title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder={`Section ${sectionIndex + 1} title`}
        />
      </Field>
      <Field label="Content">
        <Textarea
          value={draftSection.content}
          onChange={(event) => onChange(event.target.value)}
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
}: {
  draft: CodeReviewDraft;
  onAdd?: () => void;
  onJump?: (sectionId: string) => void;
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
        <button
          key={section.id}
          type="button"
          onClick={() => onJump?.(section.id)}
          className="flex w-full items-center justify-between gap-3 rounded-[18px] border border-transparent px-3 py-2.5 text-left transition-colors hover:bg-[color:var(--chrome-soft)]"
        >
          <span className="min-w-0 truncate text-sm font-medium text-foreground-soft">
            {section.title}
          </span>
          <StatusPill tone={section.checked ? "success" : "default"}>
            {section.checked ? "Checked" : "Open"}
          </StatusPill>
        </button>
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
}: {
  section: CodeReviewSectionDraft;
  fontScale: EditorFontScale;
  displayMode: "panel" | "inline";
  onChange: (
    sectionId: string,
    updater: (current: CodeReviewSectionDraft) => CodeReviewSectionDraft,
  ) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mono-label">Checklist prompts</div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-foreground-soft">
            {section.prompts.length > 0
              ? section.prompts.join(" · ")
              : "Add notes and findings for this custom review section."}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[color:var(--input-border)] bg-[color:var(--input-bg)] px-3 py-1.5">
          <Checkbox
            checked={section.checked}
            onChange={(event) =>
              onChange(section.id, (current) => ({
                ...current,
                checked: event.target.checked,
              }))
            }
          />
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Mark checked
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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
        <Field label="Severity" hint="Optional severity for the strongest finding in this section.">
          <select
            value={section.severity}
            onChange={(event) =>
              onChange(section.id, (current) => ({
                ...current,
                severity: event.target.value as CodeReviewSectionDraft["severity"],
              }))
            }
            className="flex h-12 w-full rounded-2xl border border-[color:var(--input-border)] bg-[color:var(--input-bg)] px-4 text-sm text-foreground outline-none focus-visible:border-[color:var(--chrome-focus)]"
          >
            <option value="">No severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </Field>

        <Field label="Needs verification" hint="Use when the concern is real but blocked by missing context.">
          <div className="flex h-12 items-center rounded-2xl border border-[color:var(--input-border)] bg-[color:var(--input-bg)] px-4">
            <Checkbox
              checked={section.needsVerification}
              onChange={(event) =>
                onChange(section.id, (current) => ({
                  ...current,
                  needsVerification: event.target.checked,
                }))
              }
            />
            <span className="ml-3 text-sm">Flag as needs verification</span>
          </div>
        </Field>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Field label="Notes">
          <Textarea
            value={section.notes}
            onChange={(event) =>
              onChange(section.id, (current) => ({
                ...current,
                notes: event.target.value,
              }))
            }
            placeholder="Capture what you inspected, what matters here, or any context."
            className={getEditorTextAreaClass(fontScale)}
            rows={8}
          />
        </Field>
        <Field label="Findings">
          <Textarea
            value={section.findings}
            onChange={(event) =>
              onChange(section.id, (current) => ({
                ...current,
                findings: event.target.value,
              }))
            }
            placeholder="Concrete findings, risks, or explicit no-issue conclusions."
            className={getEditorTextAreaClass(fontScale)}
            rows={8}
          />
        </Field>
      </div>
    </div>
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
  if (id === "template-document" || id === "review-document") {
    return {
      width: 760,
      height: 720,
    };
  }

  if (id === "template-preview" || id === "review-preview") {
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
  sections,
  fontScale = "md",
}: {
  title: string;
  sections: ExportSection[];
  fontScale?: EditorFontScale;
}) {
  return (
    <div className="document-preview max-h-[calc(100vh-18rem)] overflow-auto">
      <div className="border-b border-border pb-4">
        <div className="mono-label">Preview</div>
        <h3 className="mt-2 text-xl font-semibold tracking-[0.005em]">{title}</h3>
      </div>
      <div className="mt-5 space-y-6">
        {sections.map((section) => (
          <section key={section.title} className="space-y-2">
            <h4 className="text-sm font-medium tracking-[0.005em] text-foreground">{section.title}</h4>
            <DocumentText text={section.body || "Pending content."} fontScale={fontScale} />
          </section>
        ))}
      </div>
    </div>
  );
}

function DocumentText({
  text,
  fontScale = "md",
}: {
  text: string;
  fontScale?: EditorFontScale;
}) {
  const blocks = splitTextBlocks(text);
  const textClass = getPreviewTextClass(fontScale);

  return (
    <div className={`space-y-3 text-foreground-soft ${textClass}`}>
      {blocks.map((block, index) => {
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
  return {
    title: "",
    fileName: "",
    updatedAt: new Date().toISOString(),
    sections: template.sections.map((section) => ({
      id: section.id,
      title: stripSectionNumber(section.title),
      helpText: section.helpText,
      baseContent: section.starter,
      content: section.starter,
    })),
  };
}

function createCodeReviewDraft(): CodeReviewDraft {
  return {
    title: "",
    fileName: "",
    updatedAt: new Date().toISOString(),
    sections: codeReviewSections.map((section) => ({
      id: section.id,
      title: section.title,
      prompts: section.prompts,
      checked: false,
      notes: "",
      findings: "",
      severity: "",
      needsVerification: false,
    })),
  };
}

function createHelpDocDraft(doc: HelpDocument): HelpDocDraft {
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
  doc: HelpDocument,
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
  return {
    ...draft,
    sections: draft.sections.map((section, index) => {
      const definition = template.sections[index];

      return {
        ...section,
        title: stripSectionNumber(section.title),
        helpText:
          section.helpText ??
          definition?.helpText ??
          "Use this section for additional project-specific context.",
        baseContent:
          section.baseContent ??
          definition?.starter ??
          "",
      };
    }),
  };
}

function normalizeCodeReviewDraft(draft: CodeReviewDraft): CodeReviewDraft {
  return {
    ...draft,
    sections: draft.sections.map((section, index) => ({
      ...section,
      prompts: section.prompts ?? codeReviewSections[index]?.prompts ?? [],
    })),
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

function buildTemplateFileName(template: TemplateDefinition, projectName: string) {
  const prefix = slugify(projectName) || getTemplateDefaultProjectPrefix(template);
  const lockedSuffix = getTemplateLockedSuffix(template);
  return `${prefix}-${lockedSuffix}`;
}

function getTemplateDefaultProjectPrefix(template: TemplateDefinition) {
  if (template.slug === "universal-project-master-document") {
    return "universal";
  }

  return "dev";
}

function getTemplateLockedSuffix(template: TemplateDefinition) {
  if (template.slug === "dev-pipeline-master-document") {
    return "pipeline-master-document";
  }

  return "master-project-document";
}

function buildCodeReviewFileName(projectName: string) {
  const projectSlug = slugify(projectName);
  return projectSlug ? `${projectSlug}-code-review` : "code-review";
}

function buildHelpDocFileName(title: string, fallback: string) {
  return slugify(title) || fallback;
}

function generateHelpDocMarkdown(title: string, content: string) {
  return [`# ${title}`, "", content.trim() || "Pending content."].join("\n");
}

function getHelpDocCategory(doc: HelpDocument): Exclude<HelpDocFilter, "all"> {
  if (doc.slug === "ai-input") {
    return "ai";
  }

  return "product";
}

function getHelpDocCategoryLabel(doc: HelpDocument) {
  return getHelpDocCategory(doc) === "ai" ? "AI" : "Product";
}

function createDraftSectionId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function stripSectionNumber(title: string) {
  return title.replace(/^\s*\d+\s*[\.\)]\s*/, "").trim();
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

function generateTemplateMarkdown(title: string, sections: TemplateDraftSection[]) {
  return [
    `# ${title}`,
    "",
    ...sections.flatMap((section) => [
      `## ${section.title}`,
      "",
      section.content.trim() || "Pending content.",
      "",
    ]),
  ].join("\n");
}

function generateCodeReviewMarkdown(title: string, sections: CodeReviewSectionDraft[]) {
  const checkedCount = sections.filter((section) => section.checked).length;

  return [
    `# ${title}`,
    "",
    `- Checked sections: ${checkedCount}/${sections.length}`,
    "",
    ...sections.flatMap((section) => [
      `## ${section.title}`,
      "",
      `- Status: ${section.checked ? "Checked" : "Open"}`,
      `- Severity: ${section.severity || "None"}`,
      `- Needs verification: ${section.needsVerification ? "Yes" : "No"}`,
      "",
      "### Notes",
      section.notes.trim() || "No notes.",
      "",
      "### Findings",
      section.findings.trim() || "No findings recorded.",
      "",
    ]),
  ].join("\n");
}

function createCodeReviewSectionExport(section: CodeReviewSectionDraft) {
  return [
    `- Status: ${section.checked ? "Checked" : "Open"}`,
    `- Severity: ${section.severity || "None"}`,
    `- Needs verification: ${section.needsVerification ? "Yes" : "No"}`,
    "",
    "Notes",
    section.notes.trim() || "No notes.",
    "",
    "Findings",
    section.findings.trim() || "No findings recorded.",
  ].join("\n");
}

function getTemplateLens(template: TemplateDefinition): Exclude<TemplateFilter, "all"> {
  if (template.slug === "universal-project-master-document") {
    return "general";
  }

  if (template.category === "pipeline") {
    return "pipeline";
  }

  return "development";
}

function getTemplateLensLabel(template: TemplateDefinition) {
  const lens = getTemplateLens(template);

  if (lens === "general") {
    return "General";
  }

  if (lens === "pipeline") {
    return "Pipeline";
  }

  return "Development";
}

function splitTextBlocks(text: string) {
  const trimmed = text.trim();

  if (!trimmed) {
    return [{ type: "p" as const, lines: ["Pending content."] }];
  }

  return trimmed.split(/\n{2,}/).map((block) => {
    const lines = block.split("\n").filter(Boolean);

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
