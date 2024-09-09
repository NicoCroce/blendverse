type TAuth_token = { token: string } | null;

export const verifyTokenInHeader = (cookies: Record<string, unknown>) => {
  const auth_token = cookies.auth_token as TAuth_token;

  if (!auth_token) {
    console.log('🔴 Token not provided');
    return undefined;
  }

  return auth_token.token || '';
};
