import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Stripe } from 'stripe';
import stripeConfig from './config/stripe.config';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    // inject configs
    @Inject(stripeConfig.KEY)
    private readonly stripeConfiguration: ConfigType<typeof stripeConfig>,
  ) {
    this.stripe = new Stripe(this.stripeConfiguration.secret);
  }

  async createCheckoutSession(
    amount: number,
    currency: string,
    productId: string,
    quantity: number,
    redirectUrl: string,
  ): Promise<Stripe.Checkout.Session> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: currency,
              product_data: {
                name: `Test Product`,
              },
              unit_amount: amount * 100,
            },
            quantity: quantity,
          },
        ],
        mode: 'payment', // set the mode to 'payment'
        success_url: `${redirectUrl}/success.html`, // redirect URL on success
        cancel_url: `${redirectUrl}/cancel.html`, // redirect URL on cancellation
        metadata: {
          // additional data here, for handling in webhooks
          productId: productId,
        },
      });

      return session; // return the created session
    } catch (error) {
      console.error('Error creating session:', error);
      throw new InternalServerErrorException(
        'Failed to create checkout session', // handle errors gracefully
      );
    }
  }
}
