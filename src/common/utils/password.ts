import { NotImplementedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const saltOrRounds = 10;
export const hashPassword = (password: string) => {
  return bcrypt.hashSync(password, saltOrRounds);
};

export const hashPasswordSync = (password: string): string => {
  throw new NotImplementedException();
};

export const matchHashedPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
