import { Injectable } from '@nestjs/common';
import { compare, genSalt, hash } from 'bcryptjs';

@Injectable()
export class BcryptService {
  // str -> hash
  async hash(data: string): Promise<string> {
    const salt = await genSalt();
    return hash(data, salt);
  }

  // str vs hash -> bool
  compare(data: string, encrypted: string): Promise<boolean> {
    return compare(data, encrypted);
  }
}
