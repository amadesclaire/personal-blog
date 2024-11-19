import type { Metadata, ParseResult } from "./types.ts";
class Markdown {
  /*
   * Reads a file and returns its contents as a string
   */
  private static async readFile(filePath: string): Promise<string> {
    try {
      return await Deno.readTextFile(filePath);
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        throw new Deno.errors.NotFound(`File not found at ${filePath}`);
      }
      if (error instanceof Error) {
        throw new Error(`Failed to read file at ${filePath}: ${error.message}`);
      }
      throw new Error(`Failed to read file at ${filePath}: Unknown error`);
    }
  }
  /*
   * Parses JSON front matter
   */
  private static parseFrontMatter(
    rawMetadata: string,
    filePath: string
  ): Metadata {
    try {
      return JSON.parse(`{${rawMetadata}}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(
        `Failed to parse JSON front matter in ${filePath}: ${errorMessage}`
      );
    }
  }
  /*
   * Extracts front matter and markdown content from a file
   */
  public static async extractFrontMatter(
    filePath: string
  ): Promise<{ metadata: Metadata; markdown: string }> {
    const markdown = await this.readFile(filePath);

    const frontMatterMatch = markdown.match(/^{\s*([\s\S]+?)\s*}\n?/);
    if (!frontMatterMatch) return { metadata: null, markdown };

    const metadata = this.parseFrontMatter(frontMatterMatch[1], filePath);

    const markdownContent = markdown
      .substring(frontMatterMatch[0].length)
      .trim();
    return { metadata, markdown: markdownContent };
  }
  /*
   *  Parse markdown content into HTML
   */
  public static parseMarkdown(markdown: string): string {
    // Headings
    markdown = markdown.replace(/^# (.*$)/gim, "<h1>$1</h1>");
    markdown = markdown.replace(/^## (.*$)/gim, "<h2>$1</h2>");
    markdown = markdown.replace(/^### (.*$)/gim, "<h3>$1</h3>");
    markdown = markdown.replace(/^#### (.*$)/gim, "<h4>$1</h4>");
    markdown = markdown.replace(/^##### (.*$)/gim, "<h5>$1</h5>");
    markdown = markdown.replace(/^###### (.*$)/gim, "<h6>$1</h6>");

    // Bold
    markdown = markdown.replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>");
    markdown = markdown.replace(/__(.*?)__/gim, "<strong>$1</strong>");

    // Italic
    markdown = markdown.replace(/\*(.*?)\*/gim, "<em>$1</em>");
    markdown = markdown.replace(/_(.*?)_/gim, "<em>$1</em>");

    // Images
    markdown = markdown.replace(
      /!\[([^\[]+)\]\((.*?)\)/gim,
      "<img src='$2' alt='$1' />"
    );

    // Links
    markdown = markdown.replace(
      /\[([^\[]+)\]\((.*?)\)/gim,
      "<a href='$2'>$1</a>"
    );

    // Blockquotes
    markdown = markdown.replace(/^> (.*$)/gim, "<blockquote>$1</blockquote>");

    // Unordered Lists
    markdown = markdown.replace(/^\* (.*$)/gim, "<ul><li>$1</li></ul>");
    markdown = markdown.replace(/<\/ul>\n<ul>/gim, ""); // Merge consecutive lists

    // Ordered Lists
    markdown = markdown.replace(/^\d+\. (.*$)/gim, "<ol><li>$1</li></ol>");
    markdown = markdown.replace(/<\/ol>\n<ol>/gim, ""); // Merge consecutive lists

    // Line breaks
    markdown = markdown.replace(/\n{2,}/g, "<br>");

    return markdown.trim();
  }
}

export default Markdown;
