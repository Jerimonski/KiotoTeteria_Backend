import { Body, Controller, Post } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { CreateNewsletterSubscriberDto } from './dto/create-newsletter-subscriber.dto';

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  subscribe(@Body() createDto: CreateNewsletterSubscriberDto) {
    return this.newsletterService.subscribe(createDto);
  }
}
