import { describe, expect, it } from 'vitest';
import 'dotenv/config';
import { PrismaService } from './prisma.service.js';

describe('PrismaService', () => {
  it('conecta a PostgreSQL y ejecuta SELECT 1', async () => {
    const prisma = new PrismaService();
    const rows = await prisma.$queryRaw<{ one: number }[]>`SELECT 1 AS one`;
    expect(rows).toEqual([{ one: 1 }]);
    await prisma.$disconnect();
  });
});
