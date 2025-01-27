import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { OrderItem } from 'src/orders/entities/order-item.entity';
import { PaymentService } from 'src/payment/payment.service';
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
    private readonly paymentService: PaymentService,
    // transaction dep
    private readonly dataSource: DataSource,
  ) {}

  async create(createOrderDto: CreateOrderDto, id: number) {
    // init trx
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // user exists? (auto throw)
      const user = await this.usersService.findOne(id);

      // get total price
      let totalPrice = 0;
      for (const item of createOrderDto.orderItems) {
        const tea = await this.teasService.findOne(item.teaId); // Ensure tea exists
        totalPrice += tea.price * item.quantity;
      }

      const paymentSession = await this.paymentService.createCheckoutSession(
        totalPrice,
        'USD',
        'Order Payment',
        1,
        createOrderDto.redirectUrl,
      );

      // make and save order first
      const order = new Order();
      order.user = user;
      order.totalPrice = totalPrice;
      const savedOrder = await queryRunner.manager.save(order);

      // iter conn list (order <-> tea)
      for (const item of createOrderDto.orderItems) {
        // tea exists? (auto throw)
        const tea = await this.teasService.findOne(item.teaId);

        // make conn (order <-> tea)
        const orderItem = new OrderItem();
        orderItem.order = savedOrder;
        orderItem.tea = tea;
        orderItem.quantity = item.quantity;
        orderItem.price = tea.price * item.quantity;

        // save this conn
        await queryRunner.manager.save(orderItem);
      }

      // commit trx
      await queryRunner.commitTransaction();

      // return created order + relations conn & tea
      return { order: await this.findOne(savedOrder.id), paymentSession };
    } catch (error) {
      // undo trx
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      this.logger.error('Error creating order', error);
      throw new BadRequestException('Failed to create order.');
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
      this.logger.error('Error fetching orders', error);
      throw new BadRequestException('Failed to fetch orders.');
    }
  }

  async findOne(id: number) {
    try {
      const order = await this.orderRepository.findOne({
        where: { id },
        relations: { user: true, orderItems: { tea: true } },
      });
      if (!order) {
        throw new NotFoundException(`Order with ID #${id} not found.`);
      }
      return order;
    } catch (error) {
      this.logger.error(`Error fetching order ID #${id}`, error);
      throw new NotFoundException(`Failed to fetch order with ID #${id}.`);
    }
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

      // save updated order
      const updatedOrder = await queryRunner.manager.save(order);

      // edit order items if given
      if (updateOrderDto.orderItems) {
        // wipe all original conn
        await queryRunner.manager
          .createQueryBuilder()
          .delete()
          .from(OrderItem)
          .where('orderId = :orderId', { orderId: id })
          .execute();

        // iter conn list (order <-> tea)
        for (const item of updateOrderDto.orderItems) {
          // tea exists? (auto throw)
          const tea = await this.teasService.findOne(item.teaId);

          // make conn (order <-> tea)
          const orderItem = new OrderItem();
          orderItem.order = order;
          orderItem.tea = tea;
          orderItem.quantity = item.quantity;
          orderItem.price = tea.price * item.quantity;

          // save this conn
          await queryRunner.manager.save(orderItem);
        }
      }

      // commit trx
      await queryRunner.commitTransaction();

      // return created order + relations conn & tea
      return await this.findOne(updatedOrder.id);
    } catch (error) {
      // undo trx
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      this.logger.error(`Error updating order ID #${id}`, error);
      throw new BadRequestException(`Failed to update order ID #${id}.`);
    } finally {
      // release trx
      await queryRunner.release();
    }
  }

  async remove(id: number) {
    const order = await this.findOne(id);
    try {
      await this.orderRepository.remove(order);
      return { message: `Order with ID #${id} deleted successfully.` };
    } catch (error) {
      this.logger.error(`Error deleting order ID #${id}`, error);
      throw new BadRequestException(`Failed to delete order ID #${id}.`);
    }
  }
}
