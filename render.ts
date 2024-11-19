import { Eta } from "@eta-dev/eta";

const eta = new Eta({
  views: `${Deno.cwd()}/views/`,
  cache: true,
});

const defaultHeaders = {
  "Content-Type": "text/html",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/*
 * Renders a page with given template and data.
 * Wraps content in the layout template and sets default headers.
 */
export const renderPage = async (
  template: string,
  data: Record<string, unknown> = {}
): Promise<Response> => {
  try {
    const content = await eta.render(template, data);
    const html = await eta.render("layout", { ...data, body: content });

    const headers: Headers = new Headers(defaultHeaders);

    if (data.csrfToken) {
      headers.set(
        "Set-Cookie",
        `csrf_token=${data.csrfToken}; HttpOnly; Secure; SameSite=Strict`
      );
    }
    return new Response(html, { headers });
  } catch (error) {
    console.error("Error rendering page:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
