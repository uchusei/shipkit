import { part1DeepResearchPrompt } from "./part1-deep-research";
import { part2PrdMvpPrompt } from "./part2-prd-mvp";
import { part3TechDesignMvpPrompt } from "./part3-tech-design-mvp";
import { part4NotesForAgentPrompt } from "./part4-notes-for-agent";

export type VibeCodingStepDefinition = {
  id: string;
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
  prompt: string;
};

export const VIBE_CODING_CODEX_KICKOFF_PROMPT =
  "Read AGENTS.md, propose a Phase 1 plan, wait for my approval, and then build it step by step.";

export const VIBE_CODING_WORKFLOW_GUIDANCE = [
  "Work step by step. Stay inside the current step until you have a usable result.",
  "Use ChatGPT for the thinking steps, then move into Codex only when the project is ready to be executed.",
  "Keep prompts and project output separate. The prompt is the reusable instruction, the project output is what your project actually produced.",
  "Do not start building before research, PRD, and technical design are concrete enough to guide implementation.",
];

export const VIBE_CODING_BUILD_LOOP_GUIDANCE = [
  "Treat Codex like a junior developer: approve the plan, let it implement in small chunks, then verify every major change.",
  "Use a tight loop: plan, approve, execute one meaningful step, verify, then continue.",
  "Do not jump into coding before the PRD, technical design, and AGENTS workflow are in place.",
  "Use the deployment platform chosen in the technical design once the MVP passes review and verification.",
];

export const VIBE_CODING_PROJECT_SKELETON_GUIDANCE = [
  "Recommended project skeleton:",
  `project/
├── 📁 docs/
│   ├── project-research.md
│   ├── project-prd.md
│   └── project-tech-design.md
├── 📁 agent-docs/
│   ├── tech-stack.md
│   ├── code-patterns.md
│   ├── project-brief.md
│   ├── product-requirements.md
│   └── testing.md
├── 📄 AGENTS.md
├── 📄 MEMORY.md
├── 📁 specs/
├── 📁 .cursor/rules/
└── 📁 src/`,
  "Use a tight loop: plan, approve, execute one meaningful step, verify, then continue.",
];

export const VIBE_CODING_DEPLOYMENT_GUIDANCE = [
  "Deploy only after the scoped MVP works locally and the risky paths have been checked.",
  "Use the stack and platform choices from the technical design instead of improvising new infra during launch.",
  "Capture release notes, test outcomes, and follow-up fixes in this workspace so the project stays auditable.",
];

export const vibeCodingSteps: VibeCodingStepDefinition[] = [
  {
    id: "deep-research",
    title: "PART 1 — DEEP RESEARCH",
    tool: "ChatGPT",
    goal:
      "Validate the idea first. Use this step to pressure-test demand, competitors, feasibility, and whether the MVP is worth building at all.",
    requiredInputs: [
      "A short description of the idea.",
      "The problem you think you are solving.",
      "Any early assumptions about users, market, or business model.",
    ],
    howToUse: [
      "Paste the prompt into ChatGPT.",
      "Answer the follow-up questions honestly.",
      "When ChatGPT gives you the research result, paste the useful result into Project output.",
      "Export the artifact file and use it as input to Part 2.",
    ],
    artifactLabel: "Research document",
    artifactPrefix: "research",
    artifactTemplate: "[project-name]-research.md",
    artifactUsedFor: "Use this as context for Part 2 — PRD MVP.",
    outputPlaceholder:
      "[Paste the actual research result here: key findings, competitors, market risks, MVP implications, and anything that should carry into the PRD step]",
    prompt: part1DeepResearchPrompt.trim(),
  },
  {
    id: "prd-mvp",
    title: "PART 2 — PRD MVP",
    tool: "ChatGPT",
    goal:
      "Turn the idea and research into an MVP PRD. This defines what the product is, who it is for, what must be in scope, and what stays out.",
    requiredInputs: [
      "The research output from Part 1.",
      "Your decision on what the MVP should and should not include.",
      "Any hard constraints that must shape scope.",
    ],
    howToUse: [
      "Paste the prompt into ChatGPT.",
      "Give ChatGPT the research artifact from Part 1 as context.",
      "Refine until you have a strict MVP PRD.",
      "Paste the final PRD into Project output and export the artifact file.",
    ],
    artifactLabel: "PRD document",
    artifactPrefix: "prd",
    artifactTemplate: "[project-name]-prd.md",
    artifactUsedFor: "Use this as core product context for Part 3 and Part 4.",
    outputPlaceholder:
      "[Paste the actual PRD result here: product brief, scope, MVP definition, priorities, constraints, and any locked product decisions]",
    prompt: part2PrdMvpPrompt.trim(),
  },
  {
    id: "tech-design-mvp",
    title: "PART 3 — TECHNICAL DESIGN MVP",
    tool: "ChatGPT",
    goal:
      "Translate the PRD into a realistic technical design. Choose a stack you can actually ship and maintain, and make the trade-offs explicit.",
    requiredInputs: [
      "The PRD from Part 2.",
      "Any relevant research findings from Part 1.",
      "Your real constraints around time, complexity, budget, and maintenance.",
    ],
    howToUse: [
      "Paste the prompt into ChatGPT.",
      "Give ChatGPT the PRD and any important research context.",
      "Push for practical decisions, not abstract options.",
      "Paste the final technical design into Project output and export the artifact file.",
    ],
    artifactLabel: "Technical design document",
    artifactPrefix: "tech-design",
    artifactTemplate: "[project-name]-tech-design.md",
    artifactUsedFor: "Use this together with the PRD when you hand the project to Codex.",
    outputPlaceholder:
      "[Paste the actual technical design result here: stack, architecture, data/storage choices, key implementation constraints, and deployment direction]",
    prompt: part3TechDesignMvpPrompt.trim(),
  },
  {
    id: "notes-for-agent",
    title: "PART 4 — CODEX SETUP",
    tool: "Codex",
    goal:
      "Hand the finished requirements and technical design to Codex so it can set up the workspace and prepare the build context.",
    requiredInputs: [
      "The PRD from Part 2.",
      "The technical design from Part 3.",
      "A repo or workspace that Codex can actually work in.",
    ],
    howToUse: [
      "Move into Codex after the PRD and technical design are ready.",
      "Use the prompt to tell Codex how to set up the workspace and build context.",
      "Let Codex generate or update the working docs it needs in the repo.",
      "Capture the resulting handoff, AGENTS logic, or execution setup in Project output.",
    ],
    artifactLabel: "Codex workspace setup",
    artifactPrefix: "agent-setup",
    artifactTemplate: "[project-name]-agent-setup.md",
    artifactUsedFor: "Use this as the handoff summary while Codex moves into the actual build loop.",
    outputPlaceholder:
      "[Paste the actual Codex setup result here: AGENTS decisions, repo setup notes, build phases, execution rules, and anything Codex should follow during implementation]",
    prompt: part4NotesForAgentPrompt.trim(),
  },
];
