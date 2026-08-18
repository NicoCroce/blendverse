export const AUTH_COOKIE_NAME = 'auth_token';

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
} as const;

export interface ICookieResponse {
  cookie(name: string, value: string, options: object): unknown;
  clearCookie(name: string): unknown;
}

export const setAuthCookie = (res: ICookieResponse, token: string): void => {
  res.cookie(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);
};
