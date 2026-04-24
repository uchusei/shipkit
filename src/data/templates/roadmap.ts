import type { TemplateDefinition, TemplateSection } from "../types";

const roadmapTemplateSections: TemplateSection[] = [
  {
    id: "introduction",
    title: "INTRODUCTION",
    helpText: "",
    starter:
      "This document outlines the planned development trajectory for **Product Name**. It is a living document and subject to change based on user feedback, business priorities, and technical constraints.",
  },
  {
    id: "vision",
    title: "VISION",
    helpText: "",
    starter:
      "One to two sentences describing the long-term vision — where the product is heading and why.",
  },
  {
    id: "current-status",
    title: "CURRENT STATUS",
    helpText: "",
    starter: `| Metric             | Value       |
|--------------------|-------------|
| Current version    | X.X.X       |
| Stage              | Alpha / Beta / GA |
| Last release       | YYYY-MM-DD  |`,
  },
  {
    id: "roadmap-overview",
    title: "ROADMAP OVERVIEW",
    helpText: "",
    starter: `| Phase       | Timeline    | Theme                     | Status         |
|-------------|-------------|---------------------------|----------------|
| Phase 1     | Q1 YYYY     | Foundation & core MVP     | ✅ Complete     |
| Phase 2     | Q2 YYYY     | Stability & integrations  | 🔄 In progress |
| Phase 3     | Q3 YYYY     | Scale & performance       | 📋 Planned     |
| Phase 4     | Q4 YYYY     | Advanced features         | 💡 Exploratory |`,
  },
  {
    id: "phase-1-foundation-core-mvp",
    title: "PHASE 1 — FOUNDATION & CORE MVP",
    helpText: "",
    starter: `**Goal:** Define what this phase set out to achieve in one sentence.

**Timeline:** Q1 YYYY

**Status:** ✅ Complete

- [x] Item one
- [x] Item two
- [x] Item three

**Outcome:** Brief note on what was delivered and any key learnings.`,
  },
  {
    id: "phase-2-stability-integrations",
    title: "PHASE 2 — STABILITY & INTEGRATIONS",
    helpText: "",
    starter: `**Goal:** One sentence.

**Timeline:** Q2 YYYY

**Status:** 🔄 In progress

- [x] Completed item
- [ ] In-progress item
- [ ] Upcoming item

**Dependencies:** List any blockers, external dependencies, or cross-team coordination needed.`,
  },
  {
    id: "phase-3-scale-performance",
    title: "PHASE 3 — SCALE & PERFORMANCE",
    helpText: "",
    starter: `**Goal:** One sentence.

**Timeline:** Q3 YYYY

**Status:** 📋 Planned

- [ ] Item one
- [ ] Item two
- [ ] Item three

**Risks:** Known risks or open questions that could affect scope or timeline.`,
  },
  {
    id: "phase-4-advanced-features",
    title: "PHASE 4 — ADVANCED FEATURES",
    helpText: "",
    starter: `**Goal:** One sentence.

**Timeline:** Q4 YYYY

**Status:** 💡 Exploratory

- [ ] Item one
- [ ] Item two
- [ ] Item three

**Open questions:** Decisions that need to be made before committing to scope.`,
  },
  {
    id: "backlog-future-considerations",
    title: "BACKLOG & FUTURE CONSIDERATIONS",
    helpText: "",
    starter: `Items under evaluation but not yet committed to a phase.

- Item one — brief rationale
- Item two — brief rationale
- Item three — brief rationale`,
  },
  {
    id: "out-of-scope",
    title: "OUT OF SCOPE",
    helpText: "",
    starter: `Items explicitly excluded from the current roadmap and why.

- Item one — reason
- Item two — reason`,
  },
  {
    id: "how-we-prioritize",
    title: "HOW WE PRIORITIZE",
    helpText: "",
    starter:
      "Describe the prioritization framework used (e.g., impact vs. effort, RICE, MoSCoW, user feedback weight, business value). This gives stakeholders transparency into how decisions are made.",
  },
  {
    id: "how-to-provide-feedback",
    title: "HOW TO PROVIDE FEEDBACK",
    helpText: "",
    starter:
      "Describe how stakeholders, users, or contributors can influence the roadmap — GitHub Issues, feedback form, email, Slack channel, etc.",
  },
];

export const roadmapTemplate: TemplateDefinition = {
  id: "roadmap",
  slug: "roadmap",
  name: "Roadmap",
  description:
    "A living roadmap document for tracking vision, current status, phases, backlog, exclusions, prioritization, and stakeholder feedback.",
  category: "template",
  defaultFileName: "roadmap",
  overview: [
    "Use this to communicate product direction, phased plans, and roadmap status clearly.",
    "Keep it current as priorities shift with user feedback, business needs, and technical constraints.",
    "Export it as a shareable roadmap artifact in Markdown or PDF.",
  ],
  sections: roadmapTemplateSections,
};
