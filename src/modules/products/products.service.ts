import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { PaginationOptions } from 'src/common/pagination/pagination-options';
import { CreateProductDto } from './dto/create-product.dto';
import { Product, Prisma } from '@prisma/client';
interface FindAllParams {
  page?: number;
  pageSize?: number;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: 'price' | 'name';
  order?: 'asc' | 'desc';
}
@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: FindAllParams) {
    const { page, pageSize, skip, take } = PaginationOptions.resolve(params);
    const { categoryId, minPrice, maxPrice, search, sort, order } = params;
    const cleanSearch = search?.trim();
    const allowedSorts = ['price', 'name'];
    const sortOrder: Prisma.SortOrder = order === 'desc' ? 'desc' : 'asc';

    const where: Prisma.ProductWhereInput = {
      isActive: true,

      ...(categoryId !== undefined && { categoryId }),

      ...(minPrice !== undefined || maxPrice !== undefined
        ? {
            price: {
              ...(minPrice !== undefined && { gte: minPrice }),
              ...(maxPrice !== undefined && { lte: maxPrice }),
            },
          }
        : {}),

      ...(cleanSearch && {
        OR: [
          { name: { contains: cleanSearch, mode: 'insensitive' } },
          { description: { contains: cleanSearch, mode: 'insensitive' } },
        ],
      }),
    };

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: allowedSorts.includes(sort || '')
          ? [{ [sort!]: sortOrder }, { createdAt: 'desc' }]
          : { createdAt: 'desc' },
        include: {
          category: true,
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
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        isActive: true,
      },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const category = await this.prisma.category.findUnique({
      where: { id: createProductDto.categoryId },
    });

    if (!category) {
      throw new BadRequestException('Category does not exist');
    }

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
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Slug already exists');
        }

        if (error.code === 'P2003') {
          throw new BadRequestException('Category does not exist');
        }
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
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.product.delete({
      where: { id },
    });
  }
}
