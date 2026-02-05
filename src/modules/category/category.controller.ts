import { Category } from './../../DB/models/category.model';
import {
  BadRequestException,
  Controller,
  Delete,
  ForbiddenException,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard, AuthReq } from '../../common/guards/auth.guard';
import { CategoryService } from './category.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { storage } from '../../common/utils/multer/upload';
import { isValidObjectId, Types } from 'mongoose';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RoleEnum } from '../../DB/models/user.model';
import { Roles } from '../coupon/coupon.controller';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('create_category')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.ShopOwner)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: storage('category'),
    }),
  )
  async Create_Category(@Req() req: AuthReq) {
    const data: Partial<Category> = {
      name: req.body.name,
      createdBy: req.user._id,
      image: req.file?.path,
    };
    return await this.categoryService.createCategory(data);
  }
  @Post('FindAllCategories')
  async FindAllCategories() {
    return {
      data: await this.categoryService.findAllCategories(),
    };
  }
  @Patch('updateCategory/:id')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.ShopOwner)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: storage('category'),
    }),
  )
  async update_category(@Req() req: AuthReq) {
    const isAdmin: boolean = (req.user.role as string) === 'admin';
    if (!isAdmin) {
      throw new ForbiddenException('Only admins can update categories');
    }
    const categoryId = new Types.ObjectId(req.params.id);
    if (!isValidObjectId(categoryId))
      throw new BadRequestException('Invalid category ID');
    const createdBy = req.user._id;
    const image = req.file?.path;
    const name = req.body.name;
    const description = req.body.description;
    const data = await this.categoryService.updateCategory(
      categoryId,
      createdBy,
      { image, name, description },
    );
    return {
      msg: data.msg,
    };
  }

  @Patch('soft-delete/:id')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.ShopOwner)
  async SoftDelete(@Req() req: AuthReq) {
    const isAdmin: boolean = (req.user.role as string) === 'admin';
    if (!isAdmin) {
      throw new ForbiddenException('Only admins can frozen category');
    }
    const categoryId = new Types.ObjectId(req.params.id);
    if (!isValidObjectId(categoryId))
      throw new BadRequestException('Invalid category ID');
    const createdBy = req.user._id;
    const data = await this.categoryService.softDelete(categoryId, createdBy);
    return { msg: 'category soft-deleted successfully', data };
  }
  @Delete('hard-delete/:id')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.ShopOwner)
  async hardDelete(@Req() req: AuthReq) {
    const isAdmin: boolean = (req.user.role as string) === 'admin';
    if (!isAdmin) {
      throw new ForbiddenException('Only admins can delete categories');
    }
    const categoryId = new Types.ObjectId(req.params.id);
    if (!isValidObjectId(categoryId))
      throw new BadRequestException('Invalid category ID');
    const createdBy = req.user._id;
    await this.categoryService.hardDelete(categoryId, createdBy);
    return { msg: 'category deleted permanently' };
  }
  @Post('search')
  async searchCategories(@Req() req: AuthReq) {
    const keyWord = req.body.keyWord;
    return this.categoryService.searchForCategories(keyWord);
  }
}
