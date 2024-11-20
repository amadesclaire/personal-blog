import { basicAuth } from "./auth.ts";
import { getArticles, getArticleBySlug } from "./articles.ts";
import { renderPage } from "./render.ts";
import Markdown from "./markdown.ts";
import { generateCsrfToken, validateCsrfToken } from "./csrf.ts";
import { articleCache } from "./cache.ts";

const ARTICLES_DIR = "./articles";

const redirectToAdmin = (req: Request): Response => {
  const adminUrl = new URL("/admin", req.url);
  return Response.redirect(adminUrl, 303);
};

const notFoundResponse = (): Response =>
  new Response("Not Found", { status: 404 });

/*
 * Handle incoming requests
 */

const handleRequest = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const [, ...parts] = url.pathname.split("/");

  /*
   * CORS
   */
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      status: 204,
    });
  }

  /*
   * Authentication
   */
  if (["admin", "new", "edit"].includes(parts[0])) {
    const authResponse = basicAuth(req);
    if (authResponse) return authResponse;
  }

  /*
   * Application router
   */

  switch (parts[0]) {
    // Home *************************************************************
    case "": {
      const articles = await getArticles(ARTICLES_DIR);
      const cleanArticles = articles
        .map(({ title, slug, date }) => ({ title, slug, date }))
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      return renderPage("index", {
        title: "Personal Blog",
        articles: cleanArticles,
      });
    }
    // Article **********************************************************
    case "article": {
      const article = await getArticleBySlug(ARTICLES_DIR, parts[1]);
      if (!article) return notFoundResponse();
      article.content = Markdown.parseMarkdown(article.content);
      return renderPage("article", article);
    }
    // Admin ************************************************************
    case "admin": {
      const allArticles = (await getArticles(ARTICLES_DIR))?.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      return renderPage("admin", {
        title: "Article Admin",
        articles: allArticles,
      });
    }
    // Edit *************************************************************
    case "edit": {
      const editSlug = parts[1];
      const editArticle = await getArticleBySlug(ARTICLES_DIR, editSlug);
      if (!editArticle) return notFoundResponse();
      const csrfToken = generateCsrfToken();
      return renderPage("edit", {
        title: "Edit Article",
        article: editArticle,
        csrfToken,
      });
    }
    // Update ************************************************************
    case "update": {
      const validCsrfToken = validateCsrfToken(req.clone());
      if (!validCsrfToken) {
        return new Response("Invalid CSRF token", { status: 403 });
      }

      const updateSlug = parts[1];
      const existingArticle = await getArticleBySlug(ARTICLES_DIR, updateSlug);
      if (!existingArticle) return notFoundResponse();
      const updateBody = await req.text();
      const updateData = new URLSearchParams(updateBody);
      const updatedArticle = `${JSON.stringify(
        {
          title: updateData.get("title") || "",
          date: updateData.get("date") || "",
          draft: updateData.get("draft") === "true",
        },
        null,
        2
      )}\n${updateData.get("content") || ""}`;
      await Deno.writeTextFile(
        `${ARTICLES_DIR}/${updateSlug}.md`,
        updatedArticle
      );
      articleCache.invalidate(updateSlug);
      return redirectToAdmin(req);
    }
    // New ***************************************************************
    case "new": {
      const csrfToken = generateCsrfToken();
      return renderPage("new", { title: "Create New Article", csrfToken });
    }
    // Create ************************************************************
    case "create": {
      const validCsrfToken = validateCsrfToken(req.clone());
      if (!validCsrfToken) {
        return new Response("Invalid CSRF token", { status: 403 });
      }

      const createBody = await req.text();
      const createData = new URLSearchParams(createBody);
      const newSlug =
        createData.get("title")?.toLowerCase().replace(/\s/g, "-") || "";
      const newPath = `${ARTICLES_DIR}/${newSlug}.md`;
      const newArticle = `${JSON.stringify(
        {
          title: createData.get("title") || "",
          date: createData.get("date") || "",
          draft: createData.get("draft") === "true",
        },
        null,
        2
      )}\n${createData.get("content") || ""}`;
      await Deno.writeTextFile(newPath, newArticle);
      return redirectToAdmin(req);
    }
    // Delete ************************************************************
    case "delete": {
      const deleteSlug = parts[1];
      await Deno.remove(`${ARTICLES_DIR}/${deleteSlug}.md`);
      articleCache.invalidate(deleteSlug);
      return redirectToAdmin(req);
    }
    default: {
      return notFoundResponse();
    }
  }
};

// Run server
Deno.serve({
  handler: handleRequest,
  hostname: "127.0.0.1",
  port: 8000,
  onListen: ({ port, hostname }) =>
    console.log(`Listening on http://${hostname}:${port}`),
});
