/**
 * Emails allowed to moderate reviews. Comma-separated, server-only.
 * An empty or missing value allows nobody — moderation fails closed.
 *
 * ADMIN_EMAILS="you@example.com, other@example.com"
 */
export function adminEmails(source: string | undefined = process.env.ADMIN_EMAILS): string[] {
  return (source ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);
}

export function isAdminUser(
  email: string | null | undefined,
  source: string | undefined = process.env.ADMIN_EMAILS,
): boolean {
  if (!email) {
    return false;
  }

  return adminEmails(source).includes(email.trim().toLowerCase());
}
