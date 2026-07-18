/**
 * Admin authentication.
 *
 * This ships with simple, self-contained credential + signed-cookie auth so
 * the admin dashboard is protected out of the box with zero setup — see
 * ADMIN_EMAIL / ADMIN_PASSWORD in .env.example. It's intentionally isolated
 * behind this one function: swap in Supabase Auth (or any provider) here
 * without touching the login route, layout guard, or session cookie.
 */
export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<boolean> {
  const expectedEmail = process.env.ADMIN_EMAIL || "admin@pulse.dev";
  const expectedPassword = process.env.ADMIN_PASSWORD || "pulse-admin";
  return email.trim().toLowerCase() === expectedEmail.toLowerCase() && password === expectedPassword;
}
