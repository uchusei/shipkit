import type { TemplateDefinition, TemplateSection } from "../types";

const pipelineTemplateSections: TemplateSection[] = [
  {
    id: "phase-0-idea",
    title: "PHASE 0 — IDEA",
    helpText: "",
    starter: "You get an idea. This is is the idea phase. The goal is to capture the initial idea and motivation, not to document everything in detail.",
  },
  {
    id: "phase-1-discovery",
    title: "PHASE 1 — DISCOVERY",
    helpText: "",
    starter: `Goal: understand what is being built (not document everything).

Example:
- problem
- use case
- scope
- MVP
- tech direction
- risks

In this phase everything is still fluid and up for debate. The goal is to understand the problem and potential directions, not to document every detail.`,
  },
  {
    id: "phase-2-spec-build",
    title: "PHASE 2 — Dev Project Master Document — SPEC BUILD (section by section)",
    helpText: "",
    starter: `In this phase everything is pretty much set and you fill in Dev Project Master Document.

But:
- one section at a time
- with your section prompt
- with context carried between sections

This is where the real spec is built that will govern the dev project.`,
  },
  {
    id: "phase-3-internal-consistency",
    title: "PHASE 3 — INTERNAL CONSISTENCY",
    helpText: "",
    starter: `Human or AI (ChatGPT) reviews the full Dev Project Master document.
    
Prompt:

Review the full Dev Project Master Document for:
- contradictions
- duplicated logic
- missing dependencies
- inconsistent terminology
- gaps between product, tech, and domain
- anything else? think about everything

List issues only.


Update Dev Project Master Document to resolve issues.
This catches 80% of problems before external review is even needed`,
  },
  {
    id: "phase-4-external-review",
    title: "PHASE 4 — EXTERNAL REVIEW",
    helpText: "",
    starter: `Human or AI (Claude) reviews Dev Project Master Document.

Prompt:

Review the full Dev Project Master Document for:
- contradictions
- duplicated logic
- missing dependencies
- inconsistent terminology
- gaps
- overengineering
- risks
- misinterpretations ChatGPT Codex is likely to make
- missing rules
- bad constraints

List issues only.


Human or AI (Claude) = critic, not creator.
Update Dev Project Master Document to resolve issues.`,
  },
  {
    id: "phase-5-final-lock",
    title: "PHASE 5 — FINAL LOCK",
    helpText: "",
    starter: `Now you lock everything. Nothing can “drift” after this.`,
  },
  {
    id: "phase-6-build-docs",
    title: "PHASE 6 — BUILD PLAN/DOCS",
    helpText: "",
    starter: `This phase is for creating the build plan and docs that will guide Human or Codex implementation, step by step. 
    
Each step will get its own document (PDF or markdown, or both): project-build-plan-1.md, project-build-plan-2.md, project-build-plan-3.md, and so on. 
    
- Human or Codex Build Plan (sequential)
- AGENTS.md (root + nested)

Now it is executable.`,
  },
  {
    id: "phase-7-pre-build-sanity-check",
    title: "PHASE 7 — PRE BUILD SANITY CHECK",
    helpText: "",
    starter: `Prompt:
Before implementation:
- What will Human or Codex likely misunderstand?
- Where are the specs ambiguous?
- Where can implementation drift occur?
- What should be clarified before build?
List only issues.

This saves you from 50% of Human orCodex friction`,
  },
  {
    id: "phase-8-implementation",
    title: "PHASE 8 — IMPLEMENTATION (Human or Codex)",
    helpText: "",
    starter: `Human or Codex builds according to:

- Build plan docs
- AGENTS.md files`,
  },
  {
    id: "phase-9-review-loop",
    title: "PHASE 9 — REVIEW LOOP",
    helpText: "",
    starter: `After each major step and build:

- Human review
- ChatGPT → structure, architecture, direction
- Claude → critique, UX, edge cases`,
  },
];

export const devPipelineMasterDocumentTemplate: TemplateDefinition = {
  id: "dev-pipeline-master-document",
  slug: "dev-pipeline-master-document",
  name: "Dev Pipeline Master Document",
  description:
    "How and in what order? A phased workflow for taking an idea from discovery through implementation and review.",
  category: "pipeline",
  defaultFileName: "dev-pipeline-document",
  overview: [
    "Use this after the Dev Project Master Document is underway or complete.",
    "Treat the pipeline as a live process document that tracks discovery, lock decisions, implementation, and review.",
    "Claude stays in critic mode, ChatGPT structures, and Codex executes.",
  ],
  sections: pipelineTemplateSections,
};
