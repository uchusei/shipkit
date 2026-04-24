import type { TemplateDefinition, TemplateSection } from "../types";

const buildPlanSections: TemplateSection[] = [
  {
    id: "step-1",
    title: "STEP 1",
    helpText: "",
    starter: "",
  },
];

export const buildPlanTemplate: TemplateDefinition = {
  id: "build-plan",
  slug: "build-plan",
  name: "Build Plan",
  description:
    "A minimal step-by-step build planning document where you define each step and capture the output for that step.",
  category: "template",
  defaultFileName: "build-plan",
  overview: [
    "Start with STEP 1 and add more steps as the plan grows.",
    "Use SECTION NAME for each build step title and OUTPUT for the actual step instructions or result.",
    "Export as Markdown or PDF when the plan is ready to use or share.",
  ],
  sections: buildPlanSections,
};
