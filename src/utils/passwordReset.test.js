/* eslint-env jest */
import { requestPasswordReset } from './passwordReset';

const reply = (status, body = {}) => async () => ({ ok: status < 300, status, json: async () => body });

describe('requestPasswordReset', () => {
  it('sends the branded reset mail through the server', async () => {
    const send = jest.fn(reply(200, { ok: true }));
    const fallback = jest.fn();
    await requestPasswordReset('a@example.com', { baseUrl: 'https://fn', send, fallback });
    expect(send).toHaveBeenCalledWith(
      'https://fn/authEmails/password-reset',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ email: 'a@example.com' }) })
    );
    expect(fallback).not.toHaveBeenCalled();
  });

  it("sends Firebase's own mail when the server can't", async () => {
    for (const send of [jest.fn(reply(502)), jest.fn(async () => { throw new Error('offline'); })]) {
      const fallback = jest.fn(async () => {});
      await requestPasswordReset('a@example.com', { baseUrl: 'https://fn', send, fallback });
      expect(fallback).toHaveBeenCalledWith('a@example.com');
    }
  });

  it('does not go around the limit or an invalid email', async () => {
    for (const code of ['auth/too-many-requests', 'auth/invalid-email']) {
      const fallback = jest.fn();
      const send = jest.fn(reply(code === 'auth/invalid-email' ? 400 : 429, { code }));
      await expect(
        requestPasswordReset('a@example.com', { baseUrl: 'https://fn', send, fallback })
      ).rejects.toMatchObject({ code });
      expect(fallback).not.toHaveBeenCalled();
    }
  });

  it('gives no hint whether the account exists', async () => {
    const send = jest.fn(reply(502));
    const fallback = jest.fn(async () => {
      throw Object.assign(new Error('no user'), { code: 'auth/user-not-found' });
    });
    await expect(
      requestPasswordReset('nobody@example.com', { baseUrl: 'https://fn', send, fallback })
    ).resolves.toBeUndefined();
  });
});
