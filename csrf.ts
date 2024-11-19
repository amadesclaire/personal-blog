export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

export function getCsrfTokenFromCookie(req: Request): string | null {
  const cookieHeader = req.headers.get("Cookie");
  if (!cookieHeader) return null;

  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => c.trim().split("="))
  );
  return cookies["csrf_token"] || null;
}

export async function validateCsrfToken(req: Request): Promise<boolean> {
  const formData = await req.formData();
  const csrfTokenFromForm = formData.get("csrf_token");
  const csrfTokenFromCookie = getCsrfTokenFromCookie(req);

  return csrfTokenFromForm === csrfTokenFromCookie;
}
