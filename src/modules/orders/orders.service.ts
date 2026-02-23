import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Order, OrderStatus, Prisma } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaginationOptions } from './../../common/pagination/pagination-options';

interface FindAllParams {
  page: number;
  pageSize: number;
  status?: OrderStatus;
  customerEmail?: string;
}

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    try {
      return await this.prisma.order.create({
        data: {
          customerEmail: createOrderDto.customerEmail,
          status: OrderStatus.PENDING,
          totalAmount: createOrderDto.totalAmount,
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
  async updateStatus(id: number, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.prisma.order.update({
      where: { id },
      data: { status },
    });
  }
  async findOne(id: number): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }
  async findAll(params: FindAllParams) {
    const { page, pageSize, skip, take } = PaginationOptions.resolve(params);

    const { status, customerEmail } = params;

    const where = {
      ...(status && { status }),
      ...(customerEmail && { customerEmail }),
    };

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      meta: PaginationOptions.buildMeta(total, page, pageSize),
    };
  }
}
