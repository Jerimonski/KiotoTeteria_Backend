import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { PaginationOptions } from 'src/common/pagination/pagination-options';
import { CreateProductDto } from './dto/create-product.dto';
import { Product, Prisma } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';
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
  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      return await this.prisma.product.create({
        data: {
          name: createProductDto.name,
          slug: createProductDto.slug,
          description: createProductDto.description,
          price: createProductDto.price,
          categoryId: createProductDto.categoryId,
          isActive: false,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('Slug already exists');
      }
      throw error;
    }
  }

  async updateStatus(id: number, isActive: boolean): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.product.update({
      where: { id },
      data: { isActive },
    });
  }
  async remove(id: number): Promise<Product> {
    const product = this.prisma.product.delete({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return await this.prisma.product.delete({
      where: { id },
    });
  }
}
