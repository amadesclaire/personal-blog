import Markdown from "./markdown.ts";
import type { Article } from "./types.ts";
import * as path from "@std/path";
import { articleCache } from "./cache.ts";

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
export const getArticles = async (
  articlesDir: string
): Promise<Article[] | null> => {
  try {
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
            await Deno.readTextFile(filePath)
          );
          return {
            slug: file.name.replace(".md", ""),
            title: metadata?.title,
            date: metadata?.date,
            content: markdown,
          };
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          return null;
        }
      })
    );

    return articles.filter(Boolean) as Article[];
  } catch (error) {
    console.error(`Error reading articles directory: ${articlesDir}`, error);
    return null;
  }
};

/*
 * Retrieves a single article by its slug
 */
export const getArticleBySlug = async (
  articlesDir: string,
  slug: string
): Promise<Article | null> => {
  if (articleCache.has(slug)) {
    return articleCache.get(slug) || null;
  }
  const filePath = path.join(articlesDir, `${slug}.md`);
  try {
    const { metadata, markdown } = await Markdown.extractFrontMatter(filePath);
    const article = {
      slug,
      title: metadata?.title,
      date: metadata?.date,
      content: markdown,
    };
    articleCache.set(slug, article);
    return article;
  } catch (error) {
    console.error(`Error reading article file ${slug}.md:`, error);
    return handleError(error, "404 Article not found");
  }
};
