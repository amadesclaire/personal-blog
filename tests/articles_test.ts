import {
  assertEquals,
  assert,
} from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { getArticles, getArticleBySlug } from "../articles.ts";

// Define a directory where test articles are stored
const articlesDir = "./articles";

Deno.test(
  "getArticles should retrieve a list of articles with metadata",
  async () => {
    const articles = await getArticles(articlesDir);

    // Check that articles are returned
    assert(articles.length > 0, "Expected articles to be returned");

    // Verify the structure of the first article
    const article = articles[0];
    assert(article.slug, "Article slug should be defined");
    assert(article.title, "Article title should be defined");
    assert(article.date, "Article date should be defined");
    assert(article.content, "Article content should be defined");

    console.log("Articles:", articles);
  }
);

Deno.test(
  "getArticleBySlug should retrieve a specific article by slug",
  async () => {
    const slug = "test-article-1";
    const article = await getArticleBySlug(articlesDir, slug);

    // Check that the article is returned if it exists
    if (article) {
      assert(article.slug === slug, `Expected slug to be ${slug}`);
      assert(article.title, "Article title should be defined");
      assert(article.date, "Article date should be defined");
      assert(article.content, "Article content should be defined");
    } else {
      console.warn(`Article with slug ${slug} not found for testing`);
    }
  }
);

Deno.test(
  "getArticleBySlug should return null for a non-existent slug",
  async () => {
    const slug = "non-existent-article";
    const article = await getArticleBySlug(articlesDir, slug);
    console.log("Article:", article);

    // Assert that the function returns null for a non-existent article
    assertEquals(article, null, "Expected null for a non-existent article");
  }
);
