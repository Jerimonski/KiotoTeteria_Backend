import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { PaginationOptions } from 'src/common/pagination/pagination-options';
interface FindAllParams {
  page?: number;
  pageSize?: number;
  categoryId?: number;
}
@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: FindAllParams) {
    const { page, pageSize, skip, take } = PaginationOptions.resolve(params);
    const { categoryId } = params;

    const where = {
      ...(categoryId && { categoryId }),
    };

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: PaginationOptions.buildMeta(total, page, pageSize),
    };
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
}
