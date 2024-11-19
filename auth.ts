/*
 * Basic Auth middleware
 */
export function basicAuth(request: Request): Response | null {
  const username = Deno.env.get("ADMIN_USERNAME");
  const password = Deno.env.get("ADMIN_PASSWORD");
  // Check credentials are set
  if (
    typeof username !== "string" ||
    username.trim() === "" ||
    typeof password !== "string" ||
    password.trim() === ""
  ) {
    throw new Error(
      "Environment variables ADMIN_USERNAME and ADMIN_PASSWORD must be set, non-empty strings."
    );
  }

  // Check header is valid
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return new Response("Unauthorized: Invalid headers", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Admin"' },
    });
  }

  // Check credentials
  const encodedCredentials = authHeader.split(" ")[1];
  const decoded = atob(encodedCredentials);
  const [requestUsername, requestPassword] = decoded.split(":");

  if (requestUsername !== username || requestPassword !== password) {
    return new Response("Unauthorized: Invalid credentials", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Admin"' },
    });
  }

  return null;
}
