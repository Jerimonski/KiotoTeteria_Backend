import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma, Category } from '@prisma/client';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import slugify from 'slugify';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const slug = slugify(createCategoryDto.name, {
      lower: true,
      strict: true,
      trim: true,
    });

    try {
      return await this.prisma.category.create({
        data: {
          name: createCategoryDto.name,
          slug,
          isActive: createCategoryDto.isActive ?? true,
        },
      });
    } catch (error) {
      console.log(error);
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('Category name or slug already exists');
      }
      throw error;
    }
  }

  async findAll(): Promise<Category[]> {
    return this.prisma.category.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(identifier: string) {
    const isNumeric = !isNaN(Number(identifier));

    if (isNumeric) {
      return this.prisma.category.findUnique({
        where: { id: Number(identifier) },
      });
    }

    return this.prisma.category.findUnique({
      where: { slug: identifier },
    });
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    const data: Prisma.CategoryUpdateInput = {
      ...updateCategoryDto,
    };

    if (updateCategoryDto.name) {
      data.slug = slugify(updateCategoryDto.name, {
        lower: true,
        strict: true,
        trim: true,
      });
    }

    try {
      return await this.prisma.category.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('Category name or slug already exists');
      }

      throw new BadRequestException('Error updating category');
    }
  }

  async remove(id: number): Promise<Category> {
    return this.prisma.category.delete({
      where: { id },
    });
  }
}
