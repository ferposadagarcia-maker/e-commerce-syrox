import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { SalesService, type SaleWithItems } from './sales.service.js';
import { CreateSaleDto } from './dto/create-sale.dto.js';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  findAll(): Promise<SaleWithItems[]> {
    return this.salesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<SaleWithItems> {
    return this.salesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateSaleDto): Promise<SaleWithItems> {
    return this.salesService.create(dto);
  }
}
