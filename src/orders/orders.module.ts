import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import appConfig from 'src/config/app.config';
import { OrderItem } from 'src/orders/entities/order-item.entity';
import { PaymentModule } from 'src/payment/payment.module';
import { TeasModule } from 'src/teas/teas.module';
import { UsersModule } from 'src/users/users.module';
import { Order } from './entities/order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    // register entities
    TypeOrmModule.forFeature([Order, OrderItem]),
    // register configs
    ConfigModule.forFeature(appConfig),
    // deps
    TeasModule,
    UsersModule,
    PaymentModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
