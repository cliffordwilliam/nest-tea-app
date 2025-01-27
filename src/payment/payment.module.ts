import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import stripeConfig from './config/stripe.config';
import { PaymentService } from './payment.service';

@Module({
  imports: [
    // register configs
    ConfigModule.forFeature(stripeConfig),
  ],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
