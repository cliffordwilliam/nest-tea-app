import { registerAs } from '@nestjs/config';

export default registerAs('cloudinary', () => ({
  apiSecret: process.env.CLOUDINARY_API_SECRET,
  apiKey: process.env.CLOUDINARY_API_KEY,
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
}));
