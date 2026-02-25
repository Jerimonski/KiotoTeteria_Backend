import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(private readonly prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  }

  async createCheckoutSession(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if (order.status === OrderStatus.PAID) {
      throw new BadRequestException('Order already paid');
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            product_data: {
              name: `Order #${order.id}`,
            },
            unit_amount: Number(order.totalAmount) * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        orderId: order.id.toString(),
      },
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    });

    return {
      checkoutUrl: session.url,
    };
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET as string,
      );
    } catch {
      throw new BadRequestException('Invalid webhook signature');
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      const orderId = Number(session.metadata?.orderId);

      if (!orderId) return;

      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) return;

      await this.prisma.payment.create({
        data: {
          orderId,
          amount: order.totalAmount,
          status: PaymentStatus.SUCCESS,
        },
      });

      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.PAID },
      });
    }

    return { received: true };
  }
}
