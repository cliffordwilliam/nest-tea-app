import { ConfigModule, ConfigType } from '@nestjs/config';
import { v2 } from 'cloudinary';
import cloudinaryConfig from './cloudinary.config';
import { CLOUDINARY } from './cloudinary.constants';

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  imports: [ConfigModule.forFeature(cloudinaryConfig)],
  useFactory: (config: ConfigType<typeof cloudinaryConfig>) => {
    return v2.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
    });
  },
  inject: [cloudinaryConfig.KEY],
};
