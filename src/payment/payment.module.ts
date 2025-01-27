import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from 'src/config/app.config';
import stripeConfig from './config/stripe.config';
import { PaymentService } from './payment.service';

@Module({
  imports: [
    // register configs
    ConfigModule.forFeature(stripeConfig),
    ConfigModule.forFeature(appConfig),
  ],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
