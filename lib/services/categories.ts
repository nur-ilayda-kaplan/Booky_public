import { categories } from "@/data/categories";
import type { Category } from "@/types";

export async function getCategories(): Promise<Category[]> {
  return categories;
}

export async function getCategoryById(id: string): Promise<Category | undefined> {
  return categories.find((category) => category.id === id);
}
