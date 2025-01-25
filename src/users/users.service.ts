import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { BcryptService } from 'src/iam/hashing/bcrypt.service';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Role } from './enums/role.enum';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    // inject repo
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    // inject servs
    private readonly bcryptService: BcryptService,
  ) {}

  async findAll(paginationQuery: PaginationQueryDto) {
    const { limit, offset } = paginationQuery;
    try {
      return await this.userRepository.find({
        skip: offset,
        take: limit,
      });
    } catch (error) {
      this.logger.error('Error fetching all users', error);
      throw new BadRequestException('Failed to fetch users');
    }
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(
        `No user found with ID #${id}. Please check the ID.`,
      );
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    // if got pass hash it
    if (updateUserDto.password) {
      updateUserDto.password = await this.bcryptService.hash(
        updateUserDto.password,
      );
    }
    // dto -> repo instance -> save
    const user = await this.userRepository.preload({
      id,
      ...updateUserDto,
    });
    if (!user) {
      throw new NotFoundException(
        `No user found with ID #${id}. Please check the ID.`,
      );
    }
    try {
      return await this.userRepository.save(user);
    } catch (error) {
      this.logger.error(`Error updating user with ID #${id}`, error);
      throw new BadRequestException('Failed to update user');
    }
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    try {
      return await this.userRepository.remove(user);
    } catch (error) {
      this.logger.error(`Error deleting user with ID #${id}`, error);
      throw new BadRequestException('Failed to delete user');
    }
  }

  async promoteUser(id: number) {
    await this.changeRole(id, Role.Admin);
  }

  async demoteUser(id: number) {
    await this.changeRole(id, Role.Regular);
  }

  private async changeRole(id: number, role: Role) {
    // user doesnt exist
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`No user found with ID #${id}.`);
    }

    // alr promoted
    if (user.role === role) {
      throw new NotFoundException(`User ID #${id} is already promoted.`);
    }

    // promote
    user.role = role;

    try {
      await this.userRepository.save(user);
      this.logger.log(`User with ID #${id} role changed to ${Role.Admin}`);
      return user;
    } catch (error) {
      this.logger.error(`Error promoting role for user with ID #${id}`, error);
      throw new BadRequestException('Failed to change user role');
    }
  }
}
