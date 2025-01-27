import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import appConfig from 'src/config/app.config';
import { Stripe } from 'stripe';
import stripeConfig from './config/stripe.config';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    // inject configs
    @Inject(stripeConfig.KEY)
    private readonly stripeConfiguration: ConfigType<typeof stripeConfig>,
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
  ) {
    this.stripe = new Stripe(this.stripeConfiguration.secret);
  }

  async createCheckoutSession(
    amount: number,
    currency: string,
    productId: string, // Product ID can be used for better data management
    quantity: number,
  ): Promise<Stripe.Checkout.Session> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: currency,
              product_data: {
                name: `Test Product`, // You can customize the product name as needed
                // Additional product information can be added here
              },
              unit_amount: amount * 100, // Amount is in cents
            },
            quantity: quantity, // Specify the quantity of the product
          },
        ],
        mode: 'payment', // Set the mode to 'payment'
        success_url: `${this.appConfiguration.frontendUrl}/success.html`, // Redirect URL on success
        cancel_url: `${this.appConfiguration.frontendUrl}/cancel.html`, // Redirect URL on cancellation
        metadata: {
          // Pass any additional data here, such as user ID
          // or product ID for handling in webhooks
          productId: productId,
        },
      });

      return session; // Return the created session
    } catch (error) {
      console.error('Error creating session:', error);
      throw new InternalServerErrorException(
        'Failed to create checkout session', // Handle errors gracefully
      );
    }
  }
}
