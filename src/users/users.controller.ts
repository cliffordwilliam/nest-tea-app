import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Roles } from 'src/iam/authorization/decorators/role.decorator';
import { ActiveUser } from 'src/iam/decorators/active-user.decorator';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from './enums/role.enum';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.usersService.findAll(paginationQuery);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    // admin updates anyone, regular user only updates itself
    if (user.role !== Role.Admin && user.sub !== id) {
      throw new UnauthorizedException(
        'You are not allowed to update this user',
      );
    }
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number, @ActiveUser() user: ActiveUserData) {
    // admin dels anyone, regular user only dels itself
    if (user.role !== Role.Admin && user.sub !== id) {
      throw new UnauthorizedException(
        'You are not allowed to delete this user',
      );
    }
    return this.usersService.remove(id);
  }

  @Roles(Role.Admin)
  @Patch(':id/promote')
  promoteUserRole(
    @Param('id') id: number,
    @ActiveUser() adminUser: ActiveUserData,
  ) {
    // block editing own role
    if (id === adminUser.sub) {
      throw new UnauthorizedException('You cannot promote your own role');
    }
    return this.usersService.promoteUser(id);
  }

  @Roles(Role.Admin)
  @Patch(':id/demote')
  demoteUserRole(
    @Param('id') id: number,
    @ActiveUser() adminUser: ActiveUserData,
  ) {
    // block editing own role
    if (id === adminUser.sub) {
      throw new UnauthorizedException('You cannot demote your own role');
    }
    return this.usersService.demoteUser(id);
  }
}
