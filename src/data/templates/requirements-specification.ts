import type { TemplateDefinition, TemplateSection } from "../types";

const REQUIREMENTS_SPECIFICATION_DEFAULT_DOCUMENT = `1. OVERVIEW

- What is this?
- Why does it exist?
- What part of the product does this belong to?

⸻

2. PROBLEM

- What problem are we solving?
- For whom?
- What is the current behavior or limitation?
- Why is this a problem worth solving?

⸻

3. GOALS

- What should be true when this is done?
- What outcomes are we aiming for?
- What does success look like?

⸻

4. NON-GOALS

- What are we explicitly NOT solving?
- What is out of scope?

⸻

5. SCOPE

In Scope
- What is included

Out of Scope
- What is not included

⸻

6. CORE BEHAVIOR

Describe exactly what should happen.

Primary Flow
Step-by-step:

1.
2.
3.

Alternative Flows
- What happens if user takes a different path?

System Behavior
- What does the system do at each step?

⸻

7. USER INTERACTIONS

- What actions can the user take?
- What inputs are required?
- What feedback does the user get?

⸻

8. UI / UX NOTES

- Key screens or views
- Important states (loading, empty, error, success)
- Critical interactions
- Anything that must be clear, simple, or fast

⸻

9. DATA MODEL

- What data is required?
- Entities and relationships
- Required fields
- Optional fields

⸻

10. BUSINESS RULES / LOGIC

- Validation rules
- Conditional logic
- Constraints
- Edge logic

⸻

11. EDGE CASES

- What can go wrong?
- Boundary conditions
- Unexpected inputs
- Failure scenarios

⸻

12. ERROR HANDLING

- What errors can occur?
- How are they handled?
- What does the user see?
- What gets logged?

⸻

13. API / INTERFACES (if applicable)

- Endpoints
- Request / response format
- Contracts
- External dependencies

⸻

14. INTEGRATIONS (if applicable)

- External systems involved
- Data flow between systems
- Failure handling

⸻

15. SECURITY CONSIDERATIONS

- Authentication / authorization
- Sensitive data handling
- Abuse scenarios
- Input validation

⸻

16. PERFORMANCE CONSIDERATIONS

- Expected load
- Response time requirements
- Potential bottlenecks

⸻

17. OBSERVABILITY

- What should be logged?
- Metrics to track
- Alerts (if needed)

⸻

18. TEST PLAN

Unit Tests
- What needs to be covered?

Integration Tests
- Critical flows

Manual Testing
- Key scenarios

⸻

19. ACCEPTANCE CRITERIA

- What must be true for this to be considered complete?
- Concrete, testable statements

⸻

20. DEFINITION OF DONE

- Code implemented
- Tests passing
- Reviewed
- Documented
- Deployed / ready to deploy

⸻

21. DEPENDENCIES

- What does this depend on?
- What depends on this?

⸻

22. RISKS

- What might fail?
- What is uncertain?
- What could delay or break this?

⸻

23. OPEN QUESTIONS

- What is still unclear?
- What decisions are pending?

⸻

24. ASSUMPTIONS

- What are we assuming to be true?
- What has not been validated?

⸻

25. ROLLOUT NOTES (if applicable)

- How will this be released?
- Gradual rollout?
- Feature flags?

⸻

26. ROLLBACK PLAN

- What happens if this fails?
- How do we revert?

⸻

27. NOTES

- Anything else relevant`;

function trimSectionLines(lines: string[]) {
  const nextLines = [...lines];

  while (nextLines[0]?.trim() === "") {
    nextLines.shift();
  }

  while (nextLines[nextLines.length - 1]?.trim() === "") {
    nextLines.pop();
  }

  return nextLines;
}

function createSectionId(title: string, index: number) {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || `section-${index + 1}`
  );
}

function createTemplateSectionsFromDocument({
  document,
  getHeadingTitle,
}: {
  document: string;
  getHeadingTitle: (line: string) => string | null;
}) {
  const sections: TemplateSection[] = [];
  const lines = document.split("\n");
  let currentTitle = "";
  let currentLines: string[] = [];

  function pushCurrent() {
    const trimmedLines = trimSectionLines(currentLines).filter((line) => line.trim() !== "⸻");
    if (!currentTitle && trimmedLines.length === 0) {
      currentLines = [];
      return;
    }

    sections.push({
      id: createSectionId(currentTitle || `Section ${sections.length + 1}`, sections.length),
      title: currentTitle || `Section ${sections.length + 1}`,
      helpText: "",
      starter: trimmedLines.join("\n"),
    });
    currentLines = [];
  }

  lines.forEach((line) => {
    const trimmed = line.trim();
    const headingTitle = getHeadingTitle(line);

    if (headingTitle) {
      if (currentTitle || trimSectionLines(currentLines).length > 0) {
        pushCurrent();
      }
      currentTitle = headingTitle;
      return;
    }

    if (trimmed === "⸻") {
      return;
    }

    currentLines.push(line);
  });

  if (currentTitle || trimSectionLines(currentLines).length > 0) {
    pushCurrent();
  }

  return sections;
}

const requirementsTemplateSections = createTemplateSectionsFromDocument({
  document: REQUIREMENTS_SPECIFICATION_DEFAULT_DOCUMENT,
  getHeadingTitle: (line) => {
    const trimmed = line.trim();
    return /^\d+\.\s+/.test(trimmed) ? trimmed : null;
  },
});

export const requirementsSpecificationTemplate: TemplateDefinition = {
  id: "requirements-specification",
  slug: "requirements-specification",
  name: "Requirements Specification",
  description:
    "What must be true? A single editable requirements document for defining behavior, scope, edge cases, testing, rollout, and acceptance criteria.",
  category: "template",
  defaultFileName: "requirements-specification",
  overview: [
    "Use this to define a concrete requirement or feature before implementation.",
    "Keep the document strict, testable, and explicit about scope, assumptions, and risks.",
    "Export it as the source of truth for requirements, acceptance criteria, and rollout decisions.",
  ],
  sections: requirementsTemplateSections,
};
