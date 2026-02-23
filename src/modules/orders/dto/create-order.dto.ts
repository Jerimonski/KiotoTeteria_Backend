import { IsNotEmpty, IsNumber, IsEmail, Min } from 'class-validator';

export class CreateOrderDto {
  @IsEmail()
  @IsNotEmpty()
  customerEmail: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  totalAmount: number;
}
