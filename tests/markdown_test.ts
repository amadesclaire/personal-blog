import { assertEquals } from "https://deno.land/std@0.118.0/testing/asserts.ts";
import Markdown from "../markdown.ts";

Deno.test(
  "Markdown.parse should extract front matter and parse markdown",
  async () => {
    const filePath = "./articles/test-article-1.md";

    const { metadata, html } = await Markdown.parse(filePath);

    console.log("Metadata:", metadata);
    console.log("Parsed HTML:", html);

    assertEquals(metadata, {
      title: "Test Article",
      date: "2024-11-14",
      draft: false,
    });
    assertEquals(
      html,
      "<h1>Hello World</h1><br><br>This is a test of the Markdown parser."
    );
  }
);
