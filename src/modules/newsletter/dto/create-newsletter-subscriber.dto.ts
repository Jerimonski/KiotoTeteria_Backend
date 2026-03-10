import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateNewsletterSubscriberDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}
