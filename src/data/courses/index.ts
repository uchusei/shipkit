import type { CourseDocument } from "../types";
import { cybersecurityLearningPromptCourse } from "./cybersecurity-learning-prompt";
import { frontendLearningPromptCourse } from "./frontend-learning-prompt";
import { productManagementLearningPromptCourse } from "./product-management-learning-prompt";

export const courseDocuments: CourseDocument[] = [
  cybersecurityLearningPromptCourse,
  frontendLearningPromptCourse,
  productManagementLearningPromptCourse,
];
