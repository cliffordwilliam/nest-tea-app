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
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // only reg make order, reg make for itself
  @Roles(Role.Regular)
  @Post()
  create(
    @Body() createOrderDto: CreateOrderDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.ordersService.create(createOrderDto, user.sub);
  }

  // only admin can get all orders
  @Roles(Role.Admin)
  @Get()
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.ordersService.findAll(paginationQuery);
  }

  // only admin can get anyone order by id
  @Roles(Role.Admin)
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.ordersService.findOne(id);
  }

  // only admin can update anyone order
  @Roles(Role.Admin)
  @Patch(':id')
  update(@Param('id') id: number, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  // only admin can delete anyone order
  @Roles(Role.Admin)
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.ordersService.remove(id);
  }

  // for reg to get their order for themselves
  @Roles(Role.Regular)
  @Get('user/me')
  findOneByUser(@ActiveUser() user: ActiveUserData) {
    return this.ordersService.findOneByUser(user.sub);
  }
}
