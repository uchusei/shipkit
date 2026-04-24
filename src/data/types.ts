export type TemplateSection = {
  id: string;
  title: string;
  helpText: string;
  starter: string;
};

export type TemplateDefinition = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: "template" | "pipeline";
  defaultFileName: string;
  overview: string[];
  sections: TemplateSection[];
};

export type FrameworkDocument = {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
};

export type CodeReviewSectionDefinition = {
  id: string;
  title: string;
  checklist: string;
};
