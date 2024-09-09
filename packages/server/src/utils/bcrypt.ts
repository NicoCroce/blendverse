import bcrypt from 'bcryptjs';

export const comparePassword = (
  rawPassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(rawPassword, hashedPassword);
};

export const getCryptedPassword = (password: string) =>
  bcrypt.hashSync(password, 10);
