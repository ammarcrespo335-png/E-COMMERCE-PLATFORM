import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Patch,
  Post,
  Req,

  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard, AuthReq } from '../../common/guards/auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductDto } from './product.dto';
import { storage } from '../../common/utils/multer/upload';
import { isValidObjectId, Types } from 'mongoose';
import { Product } from '../../DB/models/product.model';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RoleEnum } from '../../DB/models/user.model';
import { Roles } from '../coupon/coupon.controller';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  @Post('created_product')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.ShopOwner)
  @UseInterceptors(
    FilesInterceptor('images', 4, {
      storage: storage('products'),
    }),
  )
  async created_product(
    @Req() req: AuthReq,
    @Body() dto: ProductDto,
  ): Promise<{ data: Product }> {
    const files = req.files as { path: string }[];
    const imagePaths = files?.map((f) => f.path) || [];
    const data: Partial<Product> = {
      ...dto,
      createdBy: req.user._id,
      image: imagePaths,
    };
    const product = await this.productsService.CreateProduct(data);
    return { data: product };
  }

  @Patch('update_product/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.ShopOwner)
  @UseInterceptors(
    FilesInterceptor('images', 4, {
      storage: storage('products'),
    }),
  )
  async update_product(@Req() req: AuthReq) {
    const productId = new Types.ObjectId(req.params.id);
    if (!isValidObjectId(productId))
      throw new BadRequestException('Invalid product ID');
      const files = req.files as { path: string }[];
      const imagePaths = files?.map((f) => f.path) || [];
    const createdBy = req.user._id;
;
    const name = req.body.name;
    const data = await this.productsService.updateProduct(
      productId,
      createdBy,
      { image: imagePaths, name },
    );
    return {
      msg: data.msg,
    };
  }

  @Patch('soft-delete/:id')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.ShopOwner)
  async SoftDelete(@Req() req: AuthReq) {
    const productId = new Types.ObjectId(req.params.id);
    if (!isValidObjectId(productId))
      throw new BadRequestException('Invalid product ID');
    const createdBy = req.user._id;
    const data = await this.productsService.softDelete(productId, createdBy);
    return { msg: 'Product soft-deleted successfully', data };
  }
  @Delete('hard-delete/:id')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.ShopOwner)
  async hardDelete(@Req() req: AuthReq) {
    const productId = new Types.ObjectId(req.params.id);
    if (!isValidObjectId(productId))
      throw new BadRequestException('Invalid product ID');
    const createdBy = req.user._id;
    await this.productsService.hardDelete(productId, createdBy);
    return { msg: 'Product deleted permanently' };
  }
  @Post('findAllProducts')
  async findAllProducts() {
    return {
      data: await this.productsService.findAllProducts(),
    };
  }
  @Post('search')
  async searchCategories(@Req() req: AuthReq) {
    const keyWord = req.body.keyWord;
    return this.productsService.searchForProducts(keyWord);
  }
}
