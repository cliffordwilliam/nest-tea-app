import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => {
  const password = process.env.REDIS_PASSWORD;
  if (!password) {
    throw new Error('REDIS_PASSWORD is not defined!');
  }
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password,
  };
});
