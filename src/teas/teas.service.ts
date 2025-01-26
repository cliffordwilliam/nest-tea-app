import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { UploadApiResponse } from 'cloudinary';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { DataSource, Repository } from 'typeorm';
import { CreateTeaDto } from './dto/create-tea.dto';
import { UpdateTeaDto } from './dto/update-tea.dto';
import { Tea } from './entities/tea.entity';

@Injectable()
export class TeasService {
  // logger
  private readonly logger = new Logger(TeasService.name);

  constructor(
    // inject repos
    @InjectRepository(Tea)
    private readonly teaRepository: Repository<Tea>,
    // inject 3rd party servs
    private cloudinary: CloudinaryService,
    // transaction dep
    private readonly dataSource: DataSource,
  ) {}

  async create(createTeaDto: CreateTeaDto) {
    // avoid violating unique constraint
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
      // del old img from cloudinary (auto throw err)
      await this.deleteImageFromCloudinary(tea);
      // upload new image to cloudinary
      const res = await this.cloudinary.uploadImage(file, tea.name);
      // cloudinary res ok?
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
    // tea has no img url blocker
    if (!tea.imageUrl) {
      this.logger.warn('No image URL to delete.');
      return;
    }

    try {
      await this.cloudinary.deleteImageByPublicId(tea.name);
      this.logger.log(`Image with public ID ${tea.name} deleted successfully.`);
    } catch (error) {
      this.logger.error('Error deleting image from Cloudinary', error);
      throw new BadRequestException('Failed to delete image from Cloudinary');
    }
  }

  @Cron('0 0 * * *') // runs daily at midnight
  private async resetTeaCollection() {
    // start transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // get all teas
      const allTeas = await queryRunner.manager.find(Tea);

      // got teas?
      if (allTeas.length) {
        await queryRunner.manager.remove(allTeas);
        this.logger.log(`Deleted ${allTeas.length} teas successfully.`);
      }

      // make 1 demo tea
      const demoTea1 = this.teaRepository.create({
        name: 'Demo Tea 1',
        description: 'A nice demo tea.',
        price: 5.0,
      });
      await queryRunner.manager.save(demoTea1);

      // make 1 demo tea
      const demoTea2 = this.teaRepository.create({
        name: 'Demo Tea 2',
        description: 'Another demo tea.',
        price: 6.0,
      });
      await queryRunner.manager.save(demoTea2);

      // make 1 demo tea
      const demoTea3 = this.teaRepository.create({
        name: 'Demo Tea 3',
        description: 'The best demo tea.',
        price: 7.0,
      });
      await queryRunner.manager.save(demoTea3);

      // commit transaction
      await queryRunner.commitTransaction();
      this.logger.log('Transaction committed successfully. Demo teas created.');
    } catch (error) {
      // undo transaction
      this.logger.error('Error during periodic tea cleanup', error);
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(
        'Failed to delete teas and recreate demo teas',
      );
    } finally {
      await queryRunner.release();
    }
  }
}
