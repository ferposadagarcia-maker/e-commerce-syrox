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
import { SupabaseStorageService } from '../storage/supabase-storage.service.js';
import { validateImage } from '../storage/image-validation.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';

export type ProductWithCategory = Product & {
  category: Category;
  imageUrl: string | null;
};

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: SupabaseStorageService,
  ) {}

  async create(dto: CreateProductDto): Promise<ProductWithCategory> {
    await this.ensureCategoryExists(dto.categoryId);
    try {
      const product = await this.prisma.product.create({
        data: dto,
        include: { category: true },
      });
      return this.withImageUrl(product);
    } catch (error) {
      this.handlePrismaError(error, 'reference');
    }
  }

  async findAll(): Promise<ProductWithCategory[]> {
    const products = await this.prisma.product.findMany({
      orderBy: { name: 'asc' },
      include: { category: true },
    });
    return products.map((product) => this.withImageUrl(product));
  }

  async findOne(id: string): Promise<ProductWithCategory> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) {
      throw new NotFoundException(`Producto con id "${id}" no encontrado`);
    }
    return this.withImageUrl(product);
  }

  async update(
    id: string,
    dto: UpdateProductDto,
  ): Promise<ProductWithCategory> {
    await this.ensureExists(id);
    if (dto.categoryId !== undefined) {
      await this.ensureCategoryExists(dto.categoryId);
    }
    try {
      const product = await this.prisma.product.update({
        where: { id },
        data: dto,
        include: { category: true },
      });
      return this.withImageUrl(product);
    } catch (error) {
      this.handlePrismaError(error, 'reference');
    }
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.product.findUnique({
      where: { id },
      select: { id: true, imagePath: true },
    });
    if (!existing) {
      throw new NotFoundException(`Producto con id "${id}" no encontrado`);
    }

    try {
      await this.prisma.product.delete({ where: { id } });
    } catch (error) {
      // Si PostgreSQL rechaza el borrado (p.ej. ventas históricas), NO tocamos
      // la imagen: el producto sigue existiendo y su referencia es válida.
      this.handlePrismaError(error, 'delete');
    }

    // Solo tras confirmar el borrado en PostgreSQL limpiamos la imagen.
    // Un fallo aquí no invalida la operación (el producto ya no existe).
    if (existing.imagePath) {
      await this.storage.remove(existing.imagePath);
    }
  }

  async setImage(
    id: string,
    file: Express.Multer.File | undefined,
  ): Promise<ProductWithCategory> {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Producto con id "${id}" no encontrado`);
    }

    const detected = validateImage(file, this.maxImageBytes());
    const path = this.buildObjectPath(id, detected.extension);

    // 1. Subir primero la imagen nueva. Si falla, lanza y no tocamos la BD.
    await this.storage.upload(path, file!.buffer, detected.mime);

    // 2. Persistir la referencia. Si falla, limpiar el archivo recién subido.
    let updated: Product & { category: Category };
    try {
      updated = await this.prisma.product.update({
        where: { id },
        data: { imagePath: path, imageMime: detected.mime },
        include: { category: true },
      });
    } catch (error) {
      await this.storage.remove(path);
      this.handlePrismaError(error, 'reference');
    }

    // 3. Solo tras confirmar la nueva referencia, intentar limpiar la anterior.
    const previousPath = existing.imagePath;
    if (previousPath && previousPath !== path) {
      await this.storage.remove(previousPath);
    }

    return this.withImageUrl(updated);
  }

  private buildObjectPath(productId: string, extension: string): string {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    return `products/${productId}/${unique}.${extension}`;
  }

  private maxImageBytes(): number {
    return 5 * 1024 * 1024;
  }

  private withImageUrl(
    product: Product & { category: Category },
  ): ProductWithCategory {
    return {
      ...product,
      imageUrl: product.imagePath
        ? this.storage.buildPublicUrl(product.imagePath)
        : null,
    };
  }

  private async ensureExists(id: string): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!product) {
      throw new NotFoundException(`Producto con id "${id}" no encontrado`);
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
