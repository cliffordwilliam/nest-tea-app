import {
  BadRequestException,
  ConflictException,
  Injectable,
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
    return this.teaRepository.save(tea);
  }

  findAll(paginationQuery: PaginationQueryDto) {
    const { limit, offset } = paginationQuery;
    return this.teaRepository.find({
      skip: offset,
      take: limit,
    });
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
    return this.teaRepository.save(tea);
  }

  async remove(id: number) {
    const tea = await this.findOne(id);
    return this.teaRepository.remove(tea);
  }

  // todo: in tea patch do not let client update image url by str, need to use this endpoint
  async addImage(id: number, file: Express.Multer.File) {
    // todo: think of ways to prevent abuse
    const tea = await this.findOne(id);
    try {
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
      console.error('Error uploading image:', error); // todo: use log, do not use the console.error
      throw new BadRequestException('Invalid file type.');
    }
  }
}
