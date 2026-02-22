import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.product.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
    });
  }

  async findByCategory(categoryId: number) {
    return this.prisma.product.findMany({
      where: { categoryId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async paginate(page: number, pageSize: number) {
    if (page < 1) {
      throw new Error('Page must be greater than or equal to 1');
    }

    const MAX_PAGE_SIZE = 50;

    if (pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
      throw new Error(`Page size must be between 1 and ${MAX_PAGE_SIZE}`);
    }

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.product.count(),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }
}
