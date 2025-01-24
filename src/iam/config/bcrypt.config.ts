import { registerAs } from '@nestjs/config';

export default registerAs('bcrypt', () => {
  return {
    salt: parseInt(process.env.BCRYPT_SALT || '12', 10),
  };
});
