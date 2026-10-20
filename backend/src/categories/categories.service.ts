import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, type Category } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

export type CategoryWithCount = Category & { productCount: number };

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    try {
      return await this.prisma.category.create({ data: dto });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll(includeArchived = false): Promise<CategoryWithCount[]> {
    const categories = await this.prisma.category.findMany({
      where: includeArchived ? undefined : { isActive: true },
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    });
    return categories.map(({ _count, ...category }) => ({
      ...category,
      productCount: _count.products,
    }));
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Categoría con id "${id}" no encontrada`);
    }
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    await this.findOne(id);
    try {
      return await this.prisma.category.update({ where: { id }, data: dto });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async setActive(id: string, isActive: boolean): Promise<CategoryWithCount> {
    await this.findOne(id);
    const category = await this.prisma.category.update({
      where: { id },
      data: { isActive },
      include: { _count: { select: { products: true } } },
    });
    const { _count, ...rest } = category;
    return { ...rest, productCount: _count.products };
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    const productCount = await this.prisma.product.count({
      where: { categoryId: id },
    });
    if (productCount > 0) {
      throw new ConflictException(
        'No se puede eliminar: la categoría tiene productos asociados. Archívala en su lugar.',
      );
    }
    try {
      await this.prisma.category.delete({ where: { id } });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          throw new ConflictException(
            'Ya existe una categoría con ese nombre',
          );
        case 'P2003':
          throw new ConflictException(
            'No se puede eliminar: la categoría tiene productos asociados',
          );
        case 'P2025':
          throw new NotFoundException('Categoría no encontrada');
      }
    }
    throw error;
  }
}
