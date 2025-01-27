import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Roles } from 'src/iam/authorization/decorators/role.decorator';
import { Role } from 'src/users/enums/role.enum';
import { CreateTeaDto } from './dto/create-tea.dto';
import { UpdateTeaDto } from './dto/update-tea.dto';
import { TeasService } from './teas.service';

@Controller('teas')
export class TeasController {
  constructor(private readonly teasService: TeasService) {}

  // only admin makes tea
  @Roles(Role.Admin)
  @Post()
  create(@Body() createTeaDto: CreateTeaDto) {
    return this.teasService.create(createTeaDto);
  }

  @Get()
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.teasService.findAll(paginationQuery);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.teasService.findOne(id);
  }

  // only admin edit tea
  @Roles(Role.Admin)
  @Patch(':id')
  update(@Param('id') id: number, @Body() updateTeaDto: UpdateTeaDto) {
    return this.teasService.update(id, updateTeaDto);
  }

  // only admin dels tea
  @Roles(Role.Admin)
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.teasService.remove(id);
  }

  // only admin can add tea img to cloudinary
  @Roles(Role.Admin)
  @Post(':id/image')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @Param('id') id: number,
    @UploadedFile(
      // file validations
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }), // 4MB
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.teasService.addImage(id, file);
  }
}
