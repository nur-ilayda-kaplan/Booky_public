import { getProducts } from "./products";
import { getBlogPosts } from "./blog";
import { getAuthors } from "./authors";

export interface SearchResultItem {
  id: string;
  slug: string;
  title: string;
  image?: string;
}

export interface SearchResults {
  products: SearchResultItem[];
  blogPosts: SearchResultItem[];
  authors: SearchResultItem[];
}

export async function search(query: string, limitPerType = 5): Promise<SearchResults> {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return { products: [], blogPosts: [], authors: [] };
  }

  const [products, blogPosts, authors] = await Promise.all([
    getProducts(),
    getBlogPosts(),
    getAuthors(),
  ]);

  return {
    products: products
      .filter((product) => product.title.toLowerCase().includes(normalized))
      .slice(0, limitPerType)
      .map((product) => ({
        id: product.id,
        slug: product.slug,
        title: product.title,
        image: product.coverImage,
      })),
    blogPosts: blogPosts
      .filter((post) => post.title.toLowerCase().includes(normalized))
      .slice(0, limitPerType)
      .map((post) => ({ id: post.id, slug: post.slug, title: post.title, image: post.coverImage })),
    authors: authors
      .filter((author) => author.name.toLowerCase().includes(normalized))
      .slice(0, limitPerType)
      .map((author) => ({ id: author.id, slug: author.slug, title: author.name, image: author.photo })),
  };
}
