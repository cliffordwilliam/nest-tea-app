import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { compare, genSalt, hash } from 'bcryptjs';
import bcryptConfig from '../config/bcrypt.config';

@Injectable()
export class BcryptService {
  constructor(
    // inject configs
    @Inject(bcryptConfig.KEY)
    private readonly bcryptConfiguration: ConfigType<typeof bcryptConfig>,
  ) {}

  // str pass -> hash pass
  async hash(data: string): Promise<string> {
    const salt = await genSalt(this.bcryptConfiguration.salt);
    return hash(data, salt);
  }

  // str pass vs hash pass -> bool
  compare(data: string, encrypted: string): Promise<boolean> {
    return compare(data, encrypted);
  }
}
