import { BadRequestException } from '@nestjs/common';

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class PaginationOptions {
  private static readonly DEFAULT_PAGE = 1;
  private static readonly DEFAULT_PAGE_SIZE = 10;
  private static readonly MAX_PAGE_SIZE = 50;

  static resolve(params: PaginationParams) {
    const page = params.page ?? this.DEFAULT_PAGE;
    const pageSize = params.pageSize ?? this.DEFAULT_PAGE_SIZE;

    if (page < 1) {
      throw new BadRequestException('Page must be greater than or equal to 1');
    }

    if (pageSize < 1 || pageSize > this.MAX_PAGE_SIZE) {
      throw new BadRequestException(
        `Page size must be between 1 and ${this.MAX_PAGE_SIZE}`,
      );
    }

    const skip = (page - 1) * pageSize;

    return {
      page,
      pageSize,
      skip,
      take: pageSize,
    };
  }

  static buildMeta(
    total: number,
    page: number,
    pageSize: number,
  ): PaginationMeta {
    return {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
