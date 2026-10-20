import { BadRequestException } from '@nestjs/common';

export interface DetectedImage {
  mime: 'image/jpeg' | 'image/png' | 'image/webp';
  extension: 'jpg' | 'png' | 'webp';
}

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

function detectFromMagicBytes(buffer: Buffer): DetectedImage | null {
  if (buffer.length < 12) {
    return null;
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mime: 'image/jpeg', extension: 'jpg' };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { mime: 'image/png', extension: 'png' };
  }

  // WebP: "RIFF" .... "WEBP"
  if (
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return { mime: 'image/webp', extension: 'webp' };
  }

  return null;
}

export function validateImage(
  file: Express.Multer.File | undefined,
  maxBytes: number,
): DetectedImage {
  if (!file || !file.buffer || file.buffer.length === 0) {
    throw new BadRequestException('No se recibió ningún archivo de imagen');
  }

  if (file.buffer.length > maxBytes) {
    throw new BadRequestException(
      `La imagen supera el tamaño máximo de ${Math.round(maxBytes / (1024 * 1024))} MB`,
    );
  }

  const detected = detectFromMagicBytes(file.buffer);
  if (!detected) {
    throw new BadRequestException(
      'Formato no permitido. Usa JPEG, PNG o WebP',
    );
  }

  // El tipo declarado, si viene, debe coincidir con el contenido real.
  if (
    file.mimetype &&
    ALLOWED_MIME.has(file.mimetype) &&
    file.mimetype !== detected.mime
  ) {
    throw new BadRequestException(
      'El contenido del archivo no coincide con el tipo declarado',
    );
  }

  return detected;
}
