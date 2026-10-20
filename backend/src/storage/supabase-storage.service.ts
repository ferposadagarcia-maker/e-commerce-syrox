import {
  Injectable,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export interface UploadedImage {
  path: string;
  mime: string;
}

@Injectable()
export class SupabaseStorageService {
  private readonly logger = new Logger(SupabaseStorageService.name);

  private readonly supabaseUrl: string;
  private readonly secretKey: string;
  readonly bucket: string;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY;
    const bucket = process.env.SUPABASE_STORAGE_BUCKET;

    if (!url || !key || !bucket) {
      throw new Error(
        'Faltan variables de Supabase Storage (SUPABASE_URL, SUPABASE_SECRET_KEY, SUPABASE_STORAGE_BUCKET).',
      );
    }

    this.supabaseUrl = url.replace(/\/$/, '');
    this.secretKey = key;
    this.bucket = bucket;
  }

  buildPublicUrl(path: string): string {
    return `${this.supabaseUrl}/storage/v1/object/public/${this.bucket}/${path}`;
  }

  private authHeaders(extra: Record<string, string> = {}): Record<string, string> {
    return {
      Authorization: `Bearer ${this.secretKey}`,
      apikey: this.secretKey,
      ...extra,
    };
  }

  async upload(
    path: string,
    data: Buffer,
    contentType: string,
  ): Promise<void> {
    let response: Response;
    try {
      response = await fetch(
        `${this.supabaseUrl}/storage/v1/object/${this.bucket}/${path}`,
        {
          method: 'POST',
          headers: this.authHeaders({
            'Content-Type': contentType,
            'x-upsert': 'true',
          }),
          body: new Uint8Array(data),
        },
      );
    } catch (error) {
      this.logger.error(
        `No se pudo conectar con Supabase Storage: ${(error as Error).message}`,
      );
      throw new ServiceUnavailableException(
        'No se pudo contactar el almacenamiento de imágenes',
      );
    }

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      this.logger.error(
        `Supabase Storage rechazó la subida (${response.status}): ${detail.slice(0, 200)}`,
      );
      throw new InternalServerErrorException(
        'No se pudo guardar la imagen en el almacenamiento',
      );
    }
  }

  async remove(path: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.supabaseUrl}/storage/v1/object/${this.bucket}/${path}`,
        {
          method: 'DELETE',
          headers: this.authHeaders(),
        },
      );
      if (!response.ok && response.status !== 404) {
        this.logger.warn(
          `No se pudo eliminar la imagen "${path}" (${response.status})`,
        );
      }
    } catch (error) {
      this.logger.warn(
        `Error al eliminar la imagen "${path}": ${(error as Error).message}`,
      );
    }
  }
}
