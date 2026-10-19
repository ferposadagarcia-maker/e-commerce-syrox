import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  type Product,
  type Sale,
  type SaleItem,
} from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateSaleDto } from './dto/create-sale.dto.js';

type SaleItemWithProduct = SaleItem & {
  product: Pick<Product, 'id' | 'name'>;
};

export type SaleWithItems = Sale & { items: SaleItemWithProduct[] };

interface SaleItemInput {
  productId: string;
  quantity: number;
  unitPrice: Prisma.Decimal;
  subtotal: Prisma.Decimal;
}

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSaleDto): Promise<SaleWithItems> {
    const productIds = dto.items.map((item) => item.productId);
    if (new Set(productIds).size !== productIds.length) {
      throw new BadRequestException(
        'No se permiten productos duplicados dentro de la misma venta',
      );
    }

    const found = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const productsById = new Map<string, Product>(
      found.map((product) => [product.id, product]),
    );

    const items: SaleItemInput[] = dto.items.map((item) => {
      const product = this.requireProduct(productsById, item.productId);
      const unitPrice = product.price;
      return {
        productId: product.id,
        quantity: item.quantity,
        unitPrice,
        subtotal: unitPrice.mul(item.quantity),
      };
    });

    const total = items.reduce(
      (sum, item) => sum.add(item.subtotal),
      new Prisma.Decimal(0),
    );

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      return tx.sale.create({
        data: { total, items: { create: items } },
        include: this.includeItems,
      });
    });
  }

  async findAll(): Promise<SaleWithItems[]> {
    return this.prisma.sale.findMany({
      orderBy: { createdAt: 'desc' },
      include: this.includeItems,
    });
  }

  async findOne(id: string): Promise<SaleWithItems> {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: this.includeItems,
    });
    if (!sale) {
      throw new NotFoundException(`Venta con id "${id}" no encontrada`);
    }
    return sale;
  }

  private readonly includeItems = {
    items: {
      include: {
        product: { select: { id: true, name: true } },
      },
    },
  };

  private requireProduct(
    productsById: Map<string, Product>,
    productId: string,
  ): Product {
    const product = productsById.get(productId);
    if (!product) {
      throw new NotFoundException(
        `Producto con id "${productId}" no encontrado`,
      );
    }
    return product;
  }
}
