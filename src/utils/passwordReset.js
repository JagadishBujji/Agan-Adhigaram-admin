// Password reset from the login page, the same way as the customer website:
// the shop's branded mail through our server, or Firebase's plain mail when
// the server can't send. "Invalid email" and "too many requests" are final:
// falling back would skip the server's limit.
const FINAL_CODES = ['auth/invalid-email', 'auth/too-many-requests'];
const NOT_FOUND_CODES = ['auth/user-not-found', 'auth/email-not-found'];

export async function requestPasswordReset(email, { baseUrl, send = fetch, fallback }) {
  let res;
  try {
    res = await send(`${baseUrl}/authEmails/password-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
  } catch (e) {
    res = null;
  }
  if (res && res.ok) return;
  const body = res ? await res.json().catch(() => ({})) : {};
  if (FINAL_CODES.includes(body.code)) {
    throw Object.assign(new Error(body.message || body.code), { code: body.code });
  }
  try {
    await fallback(email);
  } catch (e) {
    // same answer for unknown emails, like the server gives
    if (!NOT_FOUND_CODES.includes(e.code)) throw e;
  }
}
