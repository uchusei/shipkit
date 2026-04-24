import type { FrameworkDocument } from "../types";
import { aiCritiquePromptFramework } from "./ai-critique-prompt";
import { productAuditFramework } from "./product-audit-framework";
import { productInterrogationFramework } from "./product-interrogation-framework";

export const frameworkDocuments: FrameworkDocument[] = [
  aiCritiquePromptFramework,
  productAuditFramework,
  productInterrogationFramework,
];
