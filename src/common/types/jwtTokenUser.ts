export interface JwtTokenUser {
  username?: string | null;
  is_admin?: boolean;
  [key: string]: any;
  accountType?: string[];
  id?: number;
}

export const isJwtTokenUser = (candidate: unknown): candidate is JwtTokenUser => {
  const user = candidate as JwtTokenUser;
  return user.username !== undefined && user.id !== undefined;
};
