import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItem } from 'src/orders/entities/order-item.entity';
import { TeasModule } from 'src/teas/teas.module';
import { UsersModule } from 'src/users/users.module';
import { Order } from './entities/order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    // register entities
    TypeOrmModule.forFeature([Order, OrderItem]),
    // deps
    TeasModule,
    UsersModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
