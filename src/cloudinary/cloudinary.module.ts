import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import cloudinaryConfig from './cloudinary.config';
import { CloudinaryProvider } from './cloudinary.provider';
import { CloudinaryService } from './cloudinary.service';

@Module({
  imports: [ConfigModule.forFeature(cloudinaryConfig)],
  providers: [CloudinaryProvider, CloudinaryService],
  exports: [CloudinaryProvider, CloudinaryService],
})
export class CloudinaryModule {}
