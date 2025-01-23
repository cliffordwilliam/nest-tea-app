import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
}
