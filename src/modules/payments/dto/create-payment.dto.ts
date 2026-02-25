import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import { PaymentStatusEnum } from './payment-status.enum';

export class CreatePaymentDto {
  @IsInt()
  @IsNotEmpty()
  orderId!: number;

  @IsEnum(PaymentStatusEnum)
  @IsNotEmpty()
  status!: PaymentStatusEnum;
}
