import { Article } from "./types.ts";

//

class ArticleCache {
  private static instance: ArticleCache;
  private ArticleCache = new Map<string, Article>();
  private MAX_CACHE_SIZE = 100;

  private constructor() {}

  public static getSingleton(): ArticleCache {
    if (!ArticleCache.instance) {
      ArticleCache.instance = new ArticleCache();
    }
    return ArticleCache.instance;
  }

  has(slug: string): boolean {
    return this.ArticleCache.has(slug);
  }

  get(slug: string): Article | undefined {
    if (!this.ArticleCache.has(slug)) return undefined;
    // Move the article to the front of the cache
    const article = this.ArticleCache.get(slug)!;
    this.ArticleCache.delete(slug);
    this.ArticleCache.set(slug, article);

    return article;
  }

  set(slug: string, article: Article): void {
    if (this.ArticleCache.has(slug)) {
      this.ArticleCache.delete(slug);
    } else if (
      this.ArticleCache.size >= this.MAX_CACHE_SIZE &&
      this.MAX_CACHE_SIZE > 0 &&
      this.ArticleCache.size > 0
    ) {
      // Evict least recently used item
      const leastRecentlyUsedKey = this.ArticleCache.keys().next().value!;
      this.ArticleCache.delete(leastRecentlyUsedKey);
    }

    this.ArticleCache.set(slug, article);
  }

  invalidate(slug: string): void {
    this.ArticleCache.delete(slug);
  }
}

export const articleCache = ArticleCache.getSingleton();
