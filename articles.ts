import Markdown from "./markdown.ts";
import type { Article } from "./types.ts";
import * as path from "https://deno.land/std@0.177.0/path/mod.ts";

/*
 * Helper function to handle file reading and parsing errors
 */
const handleError = (error: unknown, message: string): null => {
  console.error(message, error);
  if (error instanceof Deno.errors.NotFound) {
    return null;
  }
  throw new Response(`<h1>${message}</h1>`, {
    status: 404,
    headers: { "Content-Type": "text/html" },
  });
};

/*
 * Retrieves all articles from the specified directory
 */
export const getArticles = async (articlesDir: string): Promise<Article[]> => {
  const files: Deno.DirEntry[] = [];
  for await (const file of Deno.readDir(articlesDir)) {
    if (file.isFile && file.name.endsWith(".md")) {
      files.push(file);
    }
  }

  const articles = await Promise.all(
    files.map(async (file) => {
      const filePath = path.join(articlesDir, file.name);
      try {
        const { metadata, markdown } = await Markdown.extractFrontMatter(
          filePath
        );
        return {
          slug: file.name.replace(".md", ""),
          title: metadata?.title,
          date: metadata?.date,
          content: markdown,
        };
      } catch (error) {
        return handleError(error, "404 Articles not found");
      }
    })
  );

  return articles.filter(Boolean) as Article[];
};

/*
 * Retrieves a single article by its slug
 */
export const getArticleBySlug = async (
  articlesDir: string,
  slug: string
): Promise<Article | null> => {
  const filePath = path.join(articlesDir, `${slug}.md`);
  try {
    const { metadata, markdown } = await Markdown.extractFrontMatter(filePath);
    return {
      slug,
      title: metadata?.title,
      date: metadata?.date,
      content: markdown,
    };
  } catch (error) {
    return handleError(error, "404 Article not found");
  }
};
