import type { TemplateDefinition } from "../types";
import { buildPlanTemplate } from "./build-plan";
import { devPipelineMasterDocumentTemplate } from "./dev-pipeline-master-document";
import { devProjectMasterDocumentTemplate } from "./dev-project-master-document";
import { readmeTemplate, README_DEFAULT_DOCUMENT } from "./readme";
import { requirementsSpecificationTemplate } from "./requirements-specification";
import { roadmapTemplate } from "./roadmap";

export { README_DEFAULT_DOCUMENT } from "./readme";

export const templates: TemplateDefinition[] = [
  devProjectMasterDocumentTemplate,
  buildPlanTemplate,
  devPipelineMasterDocumentTemplate,
  requirementsSpecificationTemplate,
  readmeTemplate,
  roadmapTemplate,
];
