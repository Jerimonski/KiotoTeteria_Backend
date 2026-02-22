import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  @Get()
  findAll() {
    return this.productsService.findAll();
  }
  @Get('paginate')
  paginate(
    @Query('page', ParseIntPipe) page: number,
    @Query('pageSize', ParseIntPipe) pageSize: number,
  ) {
    return this.productsService.paginate(page, pageSize);
  }
  @Get('category/:categoryId')
  findByCategory(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.productsService.findByCategory(categoryId);
  }
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }
}
