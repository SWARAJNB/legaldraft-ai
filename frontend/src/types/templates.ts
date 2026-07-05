// Template-related types

export type TemplateCategory = "criminal" | "civil" | "property" | "family";

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  fields: number;
  usageCount: number;
  lastUsed: string;
  previewText: string;
  tags: string[];
  isFeatured: boolean;
}

export interface Clause {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  usageCount: number;
}
