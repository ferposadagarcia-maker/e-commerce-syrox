import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  type Category,
  type Product,
} from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';

export type ProductWithCategory = Product & { category: Category };

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductDto): Promise<ProductWithCategory> {
    await this.ensureCategoryExists(dto.categoryId);
    try {
      return await this.prisma.product.create({
        data: dto,
        include: { category: true },
      });
    } catch (error) {
      this.handlePrismaError(error, 'reference');
    }
  }

  async findAll(): Promise<ProductWithCategory[]> {
    return this.prisma.product.findMany({
      orderBy: { name: 'asc' },
      include: { category: true },
    });
  }

  async findOne(id: string): Promise<ProductWithCategory> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) {
      throw new NotFoundException(`Producto con id "${id}" no encontrado`);
    }
    return product;
  }

  async update(
    id: string,
    dto: UpdateProductDto,
  ): Promise<ProductWithCategory> {
    await this.findOne(id);
    if (dto.categoryId !== undefined) {
      await this.ensureCategoryExists(dto.categoryId);
    }
    try {
      return await this.prisma.product.update({
        where: { id },
        data: dto,
        include: { category: true },
      });
    } catch (error) {
      this.handlePrismaError(error, 'reference');
    }
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    try {
      await this.prisma.product.delete({ where: { id } });
    } catch (error) {
      this.handlePrismaError(error, 'delete');
    }
  }

  private async ensureCategoryExists(categoryId: string): Promise<void> {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException(
        `Categoría con id "${categoryId}" no encontrada`,
      );
    }
  }

  private handlePrismaError(
    error: unknown,
    operation: 'reference' | 'delete',
  ): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2003':
          if (operation === 'delete') {
            throw new ConflictException(
              'No se puede eliminar: el producto está asociado a ventas históricas',
            );
          }
          throw new NotFoundException('La categoría referenciada no existe');
        case 'P2025':
          throw new NotFoundException('Producto no encontrado');
      }
    }
    throw error;
  }
}
