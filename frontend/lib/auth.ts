import Cookies from 'js-cookie';

const TOKEN_KEY = 'mfa_token';

export function getToken(): string | undefined {
  return Cookies.get(TOKEN_KEY);
}

export function setToken(token: string, remember = false): void {
  Cookies.set(TOKEN_KEY, token, {
    expires: remember ? 7 : undefined,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });
}

export function clearToken(): void {
  Cookies.remove(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
