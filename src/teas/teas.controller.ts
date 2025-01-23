import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Roles } from 'src/iam/authorization/decorators/role.decorator';
import { ActiveUser } from 'src/iam/decorators/active-user.decorator';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface';
import { Role } from 'src/users/enums/role.enum';
import { CreateTeaDto } from './dto/create-tea.dto';
import { UpdateTeaDto } from './dto/update-tea.dto';
import { TeasService } from './teas.service';

@Controller('teas')
export class TeasController {
  constructor(private readonly teasService: TeasService) {}

  @Roles(Role.Admin)
  @Post()
  create(@Body() createTeaDto: CreateTeaDto) {
    return this.teasService.create(createTeaDto);
  }

  @Get()
  findAll(
    @Query() paginationQuery: PaginationQueryDto,
    @ActiveUser() user: ActiveUserData | undefined,
  ) {
    console.log(user);
    return this.teasService.findAll(paginationQuery);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.teasService.findOne(id);
  }

  @Roles(Role.Admin)
  @Patch(':id')
  update(@Param('id') id: number, @Body() updateTeaDto: UpdateTeaDto) {
    return this.teasService.update(id, updateTeaDto);
  }

  @Roles(Role.Admin)
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.teasService.remove(id);
  }
}
