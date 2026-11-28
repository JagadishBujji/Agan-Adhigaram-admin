import { auth, FUNCTIONS_BASE_URL } from '../services/firebase';

// Invoice, resend and sales report are for a logged in admin only:
// every call carries the admin's login token.
export const adminFetch = async (path, options = {}) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Please log in again');
  }
  const token = await user.getIdToken();
  return fetch(`${FUNCTIONS_BASE_URL}${path}`, {
    ...options,
    headers: { ...(options.headers || {}), Authorization: `Bearer ${token}` },
  });
};

// reads the error the function sent back, or a plain message
export const errorMessage = async (response, fallback) => {
  if (response.status === 401) return 'Admin login required, please log in again';
  try {
    const data = await response.json();
    return data.error || data.message || fallback;
  } catch (e) {
    return fallback;
  }
};
