import { Controller, Post, Body, Headers, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import type { Request } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-session')
  createSession(@Body('orderId') orderId: number) {
    return this.paymentsService.createCheckoutSession(orderId);
  }

  @Post('webhook')
  webhook(@Req() req: Request, @Headers('stripe-signature') signature: string) {
    return this.paymentsService.handleWebhook(req.body as Buffer, signature);
  }
}
