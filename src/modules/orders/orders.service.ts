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
    const { customerEmail, items } = createOrderDto;

    if (!items || items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    return this.prisma.$transaction(async (tx) => {
      const productIds = items.map((i) => i.productId);

      const products = await tx.product.findMany({
        where: { id: { in: productIds }, isActive: true },
      });

      if (products.length !== productIds.length) {
        throw new BadRequestException('One or more products are invalid');
      }

      let total = new Prisma.Decimal(0);

      const orderItemsData = items.map((item) => {
        const product = products.find((p) => p.id === item.productId);

        if (!product) {
          throw new BadRequestException(`Product ${item.productId} not found`);
        }

        const lineTotal = product.price.mul(item.quantity);
        total = total.add(lineTotal);

        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.price,
        };
      });

      const order = await tx.order.create({
        data: {
          customerEmail,
          status: OrderStatus.PENDING,
          totalAmount: total,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      return order;
    });
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
