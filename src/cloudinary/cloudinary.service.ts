import { Injectable } from '@nestjs/common';
import {
  UploadApiErrorResponse,
  UploadApiResponse,
  v2 as cloudinary,
} from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  async uploadImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      // Create a readable stream from the buffer
      const stream = Readable.from(file.buffer);

      // Upload the stream to Cloudinary
      const upload = cloudinary.uploader.upload_stream(
        { folder: 'teas' }, // todo: move this to env
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
}
