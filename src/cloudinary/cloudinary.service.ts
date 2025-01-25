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
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      // Create a readable stream from the buffer
      const stream = Readable.from(file.buffer);

      // Upload the stream to Cloudinary
      const upload = cloudinary.uploader.upload_stream(
        { folder: this.cloudinaryConfiguration.folder },
        (error, result) => {
          if (error) {
            // Reject with an error object
            reject(new Error(error.message || 'Image upload failed'));
          } else if (!result) {
            // Handle the case where result is undefined
            reject(new Error('Unexpected undefined result from Cloudinary'));
          } else {
            // Resolve with the result
            resolve(result);
          }
        },
      );

      // Pipe the stream into the Cloudinary upload stream
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
