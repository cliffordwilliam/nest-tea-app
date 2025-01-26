import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import {
  UploadApiErrorResponse,
  UploadApiResponse,
  v2 as cloudinary,
} from 'cloudinary';
import { Readable } from 'stream';
import cloudinaryConfig from './cloudinary.config';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  constructor(
    // inject configs
    @Inject(cloudinaryConfig.KEY)
    private readonly cloudinaryConfiguration: ConfigType<
      typeof cloudinaryConfig
    >,
  ) {}
  async uploadImage(
    file: Express.Multer.File,
    publicId: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      // buffer -> readable stream
      const stream = Readable.from(file.buffer);

      // upload stream to cloudinary
      const upload = cloudinary.uploader.upload_stream(
        { folder: this.cloudinaryConfiguration.folder, public_id: publicId },
        (error, result) => {
          if (error) {
            // reject with error object
            reject(new Error(error.message || 'Image upload failed'));
          } else if (!result) {
            // handle result undefined
            reject(new Error('Unexpected undefined result from Cloudinary'));
          } else {
            // resolve result
            resolve(result);
          }
        },
      );

      // pipe stream -> cloudinary upload stream
      stream.pipe(upload);
    });
  }

  async deleteImageByPublicId(publicId: string): Promise<any> {
    try {
      return await cloudinary.uploader.destroy(
        this.cloudinaryConfiguration.folder + '/' + publicId,
      );
    } catch (error) {
      this.logger.error('Failed to delete image from Cloudinary', error);
      throw new Error('Failed to delete image from Cloudinary');
    }
  }
}
