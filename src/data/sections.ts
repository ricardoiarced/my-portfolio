export const sections = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
] as const;

// Preserve links from the previous homepage and its case studies.
export const sectionAliases: Record<string, string> = { top: "about", "featured-projects": "projects" };
