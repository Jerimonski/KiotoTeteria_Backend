import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateNewsletterSubscriberDto } from './dto/create-newsletter-subscriber.dto';

@Injectable()
export class NewsletterService {
  constructor(private readonly prisma: PrismaService) {}

  async subscribe(createDto: CreateNewsletterSubscriberDto) {
    const { email } = createDto;

    const existing = await this.prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      throw new ConflictException('Email already subscribed');
    }

    return this.prisma.newsletterSubscriber.create({
      data: {
        email,
      },
    });
  }
}
