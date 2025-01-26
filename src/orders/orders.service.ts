import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { OrderItem } from 'src/orders/entities/order-item.entity';
import { TeasService } from 'src/teas/teas.service';
import { UsersService } from 'src/users/users.service';
import { DataSource, Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersService {
  // logger
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    // inject repos
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    // deps
    private readonly teasService: TeasService,
    private readonly usersService: UsersService,
    // transaction dep
    private readonly dataSource: DataSource,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    // init trx
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // user exists? (auto throw)
      const user = await this.usersService.findOne(createOrderDto.userId);

      // make and save order first
      const order = new Order();
      order.user = user;
      order.totalPrice = createOrderDto.totalPrice;
      const savedOrder = await queryRunner.manager.save(order);

      // iter conn list (order <-> tea)
      await Promise.all(
        createOrderDto.orderItems.map(async (item) => {
          // tea exists? (auto throw)
          const tea = await this.teasService.findOne(item.teaId);

          // make conn (order <-> tea)
          const orderItem = new OrderItem();
          orderItem.order = savedOrder;
          orderItem.tea = tea;
          orderItem.quantity = item.quantity;
          orderItem.price = item.price;

          // save this conn
          await queryRunner.manager.save(orderItem);
        }),
      );

      // commit trx
      await queryRunner.commitTransaction();

      // return created order + relations conn & tea
      return await this.findOne(savedOrder.id);
    } catch (error) {
      // undo trx
      await queryRunner.rollbackTransaction();
      this.logger.error('Error creating order', error);
      throw new BadRequestException('Failed to create order');
    } finally {
      // release trx
      await queryRunner.release();
    }
  }

  findAll(paginationQuery: PaginationQueryDto) {
    const { limit, offset } = paginationQuery;
    try {
      return this.orderRepository.find({
        skip: offset,
        take: limit,
        relations: { user: true, orderItems: { tea: true } },
      });
    } catch (error) {
      this.logger.error('Error fetching all order', error);
      throw new BadRequestException('Failed to fetch order');
    }
  }

  async findOne(id: number) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: { user: true, orderItems: { tea: true } },
    });
    if (!order) {
      throw new NotFoundException(
        `No order found with ID #${id}. Please check the ID.`,
      );
    }
    return order;
  }

  async findOneByUser(id: number) {
    const user = await this.usersService.findOne(id);
    const order = await this.orderRepository.findOne({
      where: { user },
      relations: { user: true, orderItems: { tea: true } },
    });
    if (!order) {
      throw new NotFoundException(
        `No order found with user ID #${id}. Please check the user ID.`,
      );
    }
    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    // init trx
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // target order exists? if no throw
      const order = await this.findOne(id);

      // edit user if given
      if (updateOrderDto.userId) {
        const user = await this.usersService.findOne(updateOrderDto.userId);
        order.user = user;
      }

      // edit total price if given
      if (updateOrderDto.totalPrice !== undefined) {
        order.totalPrice = updateOrderDto.totalPrice;
      }

      // edit order items if given
      if (updateOrderDto.orderItems) {
        // wipe original conn
        await queryRunner.manager.delete(OrderItem, { order: { id } });

        // iter conn list (order <-> tea)
        await Promise.all(
          updateOrderDto.orderItems.map(async (item) => {
            // tea exists? (auto throw)
            const tea = await this.teasService.findOne(item.teaId);

            // make conn (order <-> tea)
            const orderItem = new OrderItem();
            orderItem.order = order;
            orderItem.tea = tea;
            orderItem.quantity = item.quantity;
            orderItem.price = item.price;

            // save this conn
            await queryRunner.manager.save(orderItem);
          }),
        );
      }

      // save updated order
      const updatedOrder = await queryRunner.manager.save(order);

      // commit trx
      await queryRunner.commitTransaction();

      // return created order + relations conn & tea
      return await this.findOne(updatedOrder.id);
    } catch (error) {
      // undo trx
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error updating order ID #${id}`, error);
      throw new BadRequestException('Failed to update order');
    } finally {
      // release trx
      await queryRunner.release();
    }
  }

  async remove(id: number) {
    const order = await this.findOne(id);
    try {
      return await this.orderRepository.remove(order);
    } catch (error) {
      this.logger.error(`Error deleting order with ID #${id}`, error);
      throw new BadRequestException('Failed to delete order');
    }
  }
}
