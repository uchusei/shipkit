import type { TemplateDefinition, TemplateSection } from "../types";

const devProjectSections: TemplateSection[] = [
  {
    id: "product-brief",
    title: "PRODUCT BRIEF",
    helpText: `– What the product is
– Why it exists
– Core use case (concrete flow)
– Core features
– Non-goals (explicit)
– Product principles
– MVP scope
– MVP vs Post-MVP breakdown
– Priority order (what is built first, second, third)
– Must-have vs Nice-to-have
– Explicit exclusions (what will NOT be built now)
– Dependencies between features`,
    starter: "",
  },
  {
    id: "technical-specification",
    title: "TECHNICAL SPECIFICATION",
    helpText: `– Tech stack (LOCKED)
– Forbidden technologies
– Architecture (layers, boundaries)
– App structure (monorepo / packages / apps)
– State & data flow
– Storage
– Dependencies
– Performance constraints
– Security constraints
– Implementation rules`,
    starter: "",
  },
  {
    id: "domain-model",
    title: "DOMAIN MODEL / DATA MODEL",
    helpText: `– Entities
– Relationships
– Statuses
– State transitions
– Business rules
– Derived models`,
    starter: "",
  },
  {
    id: "ux-ui-specification",
    title: "UX / UI SPECIFICATION",
    helpText: `– Navigation structure
– Pages / views
– Components
– Interaction flows
– Form logic
– Empty states
– Error states
– Interaction rules
– Color palette (primary, secondary, neutrals, semantic colors)
– Typography (font families, scale, hierarchy)
– Spacing system (grid, padding, margins)
– Border radius / shape language
– Elevation (shadows, layers)
– Icon system (style, stroke, size rules)
– Illustration style (if applicable)

Visual hierarchy rules:
– Information density (tight vs spacious)
– Clarity vs expressiveness
– Consistency rules
– Minimalism vs richness

States per component:
– default
– hover
– active
– disabled
– loading
– error
– Variants (primary, secondary, destructive, etc.)
– Composition rules (how components can be combined)

Grid system (columns, breakpoints):
– Page structure rules
– Container widths
– Responsive behavior

Primary navigation vs secondary:
– Breadcrumb logic
– URL / routing structure (if relevant)
– Navigation constraints (what must not be done)

Microinteractions:
– Animation principles (duration, easing)
– Feedback timing
– Transition rules

Max elements per view:
– Progressive disclosure rules
– Default vs advanced flows
– Error prevention vs error handling

Colors as tokens:
– Spacing tokens
– Typography tokens

Brand personality:
– Visual tone (clinical, brutalist, soft, premium, etc.)
– Logo usage rules
– Color meaning (not just colors)
– Brand constraints (what must NEVER be done)

Inspiration references:
– Anti-references (what it should NOT be)`,
    starter: "",
  },
  {
    id: "content-specification",
    title: "CONTENT SPECIFICATION",
    helpText: `– Labels / text / UI copy
– Naming (fields, actions, statuses)
– System messages (errors, warnings, confirmations)
– Tone (short, functional)`,
    starter: "",
  },
  {
    id: "database-schema",
    title: "DATABASE SCHEMA",
    helpText: `– Tables
– Columns
– Indexes
– Constraints
– Foreign keys
– Snapshot strategy`,
    starter: "",
  },
  {
    id: "validation-contracts",
    title: "VALIDATION & CONTRACTS",
    helpText: `– Zod schemas (or equivalent)
– Type definitions
– Service contracts
– Repository contracts
– Domain validation rules`,
    starter: "",
  },
  {
    id: "business-rules-logic",
    title: "BUSINESS RULES / LOGIC SPECIFICATION",
    helpText: `– Financial rules
– Status rules
– Immutable data rules
– Edge cases
– Derived logic`,
    starter: "",
  },
  {
    id: "api-interface",
    title: "API / INTERFACE SPECIFICATION (IF APPLICABLE)",
    helpText: `– Endpoints / commands / IPC
– Input format
– Output format
– Error handling`,
    starter: "",
  },
  {
    id: "integration-specification",
    title: "INTEGRATION SPECIFICATION (IF APPLICABLE)",
    helpText: `– External systems
– Data formats
– Constraints
– Fallback behavior`,
    starter: "",
  },
  {
    id: "security-compliance",
    title: "SECURITY / COMPLIANCE NOTES",
    helpText: `– Data protection
– Storage (local / cloud)
– Auth (or NO auth)
– Permissions
– Handling of sensitive data`,
    starter: "",
  },
  {
    id: "test-qa-plan",
    title: "TEST / QA PLAN",
    helpText: `– What should be tested
– Unit tests
– Edge cases
– Determinism (if needed)
– Testing tools`,
    starter: "",
  },
  {
    id: "deployment-release-plan",
    title: "DEPLOYMENT / RELEASE PLAN",
    helpText: `– Environments (dev / prod)
– Build process
– Distribution
– Versioning`,
    starter: "",
  },
  {
    id: "observability-debug",
    title: "OBSERVABILITY / DEBUG STRATEGY",
    helpText: `– Logging
– Error handling strategy
– Debug tools
– Debugging strategy`,
    starter: "",
  },
  {
    id: "codex-build-plan",
    title: "HUMAN/CODEX BUILD PLAN/DOCS",
    helpText: `– Do NOT generate the entire app in one step
– Sequential steps. Use sequential tasks: Step 1, Step 2, Step 3, Step 4, and so on – until the final step where the product/MVP build plan is complete.

Each step will get its own document: project-build-plan-1.md, project-build-plan-2.md, project-build-plan-3.md, and so on. 

State the steps for each build plan clearly, and in order, from step 1 to final MVP/product build plan. 

Output:
Do not generate the entire build plan here, we will do that later. Instead, generate the steps for this project, like this:

– Step 1: Title, description, expected output
– Step 2: Title, description, expected output
– Step 3: Title, description, expected output
and so on, until the final step where the build plan is complete (final product). 
`,
    starter: "",
  },
  {
    id: "agents-instructions",
    title: "AGENTS.MD INSTRUCTIONS (IF APPLICABLE)",
    helpText: `Root AGENTS.md
– Project overview
– Rules
– Code style
– Constraints

Nested AGENTS.md
– Per app/package
– Local rules`,
    starter: "",
  },
  {
    id: "open-questions-locked-decisions",
    title: "OPEN QUESTIONS / LOCKED DECISIONS",
    helpText: `– Locked decisions (must not be changed)
– Open questions
– What is flexible vs what is locked`,
    starter: "",
  },
];

export const devProjectMasterDocumentTemplate: TemplateDefinition = {
  id: "dev-project-master-document",
  slug: "dev-project-master-document",
  name: "Dev Project Master Document",
  description:
    "What are we building? A governing document for product, technical, UX/UI, domain, QA, and release decisions for a dev project.",
  category: "template",
  defaultFileName: "dev-project-document",
  overview: [
    "Use this as the main governing document for a code/app/system project.",
    "Fill one section at a time, carry context forward, and lock decisions before implementation begins.",
    "When complete, it should remove ambiguity across product, tech, and domain decisions.",
  ],
  sections: devProjectSections,
};
