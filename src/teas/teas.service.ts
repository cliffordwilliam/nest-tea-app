import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UploadApiResponse } from 'cloudinary';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Repository } from 'typeorm';
import { CreateTeaDto } from './dto/create-tea.dto';
import { UpdateTeaDto } from './dto/update-tea.dto';
import { Tea } from './entities/tea.entity';

@Injectable()
export class TeasService {
  private readonly logger = new Logger(TeasService.name);

  constructor(
    // inject repo
    @InjectRepository(Tea)
    private readonly teaRepository: Repository<Tea>,
    // inject 3rd party servs
    private cloudinary: CloudinaryService,
  ) {}

  async create(createTeaDto: CreateTeaDto) {
    // prevent violating unique constraint
    const existingTea = await this.teaRepository.findOneBy({
      name: createTeaDto.name.trim().replace(/\s+/g, ' '),
    });
    if (existingTea) {
      throw new ConflictException(
        `Tea with name ${createTeaDto.name} already exists`,
      );
    }
    // dto -> repo instance -> save
    const tea = this.teaRepository.create(createTeaDto);
    try {
      return await this.teaRepository.save(tea);
    } catch (error) {
      this.logger.error('Error creating tea', error);
      throw new BadRequestException('Failed to create tea');
    }
  }

  async findAll(paginationQuery: PaginationQueryDto) {
    const { limit, offset } = paginationQuery;
    try {
      return await this.teaRepository.find({
        skip: offset,
        take: limit,
      });
    } catch (error) {
      this.logger.error('Error fetching all teas', error);
      throw new BadRequestException('Failed to fetch teas');
    }
  }

  async findOne(id: number) {
    const tea = await this.teaRepository.findOne({
      where: { id },
    });
    if (!tea) {
      throw new NotFoundException(
        `No tea found with ID #${id}. Please check the ID.`,
      );
    }
    return tea;
  }

  async update(id: number, updateTeaDto: UpdateTeaDto) {
    // dto -> repo instance -> save
    const tea = await this.teaRepository.preload({
      id,
      ...updateTeaDto,
    });
    if (!tea) {
      throw new NotFoundException(
        `No tea found with ID #${id}. Please check the ID.`,
      );
    }
    try {
      return await this.teaRepository.save(tea);
    } catch (error) {
      this.logger.error(`Error updating tea with ID #${id}`, error);
      throw new BadRequestException('Failed to update tea');
    }
  }

  async remove(id: number) {
    const tea = await this.findOne(id);
    // delete tea image from cloudinary (auto throw err)
    await this.deleteImageFromCloudinary(tea);
    // delete tea from my db
    try {
      return await this.teaRepository.remove(tea);
    } catch (error) {
      this.logger.error(`Error deleting tea with ID #${id}`, error);
      throw new BadRequestException('Failed to delete tea');
    }
  }

  async addImage(id: number, file: Express.Multer.File) {
    const tea = await this.findOne(id);
    try {
      // delete old tea image from cloudinary (auto throw err)
      await this.deleteImageFromCloudinary(tea);
      // upload new image to cloudinary
      const res = await this.cloudinary.uploadImage(file);
      // res ok?
      if ((res as UploadApiResponse).secure_url) {
        const imageUrl = (res as UploadApiResponse).secure_url;
        // update tea image url
        tea.imageUrl = imageUrl;
        await this.teaRepository.save(tea);
        // give client updated tea
        return tea;
      } else {
        // res err? throw
        throw new BadRequestException('Image upload failed');
      }
    } catch (error) {
      this.logger.error('Error uploading image:', error);
      throw new BadRequestException('Failed to upload image');
    }
  }

  private async deleteImageFromCloudinary(tea: Tea) {
    const imageUrl = tea.imageUrl;
    if (imageUrl) {
      try {
        const imageUrlParts = imageUrl.split('/');
        if (imageUrlParts.length > 0) {
          const oldPublicId = imageUrlParts.pop()?.split('.')[0];
          if (oldPublicId) {
            await this.cloudinary.deleteImageByPublicId(oldPublicId);
            this.logger.log(
              `Image with public ID ${oldPublicId} deleted successfully.`,
            );
          }
        }
      } catch (error) {
        this.logger.error('Error deleting image from Cloudinary', error);
        throw new BadRequestException('Failed to delete image from Cloudinary');
      }
    } else {
      this.logger.warn('No image URL to delete.');
    }
  }
}
