import { registerAs } from '@nestjs/config';

export default registerAs('stripe', () => {
  const secret = process.env.STRIPE_SECRET;
  if (!secret) {
    throw new Error('STRIPE_SECRET is not defined!');
  }
  return {
    secret,
  };
});
