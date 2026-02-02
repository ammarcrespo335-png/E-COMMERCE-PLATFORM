import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ShopService } from './shop.service';
import { AuthGuard, AuthReq } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../coupon/coupon.controller';
import { RoleEnum } from '../../DB/models/user.model';
import { isValidObjectId, Types } from 'mongoose';
import { FileInterceptor } from '@nestjs/platform-express';
import { storage } from '../../common/utils/multer/upload';

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}
  @Post('create_shop')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.ShopOwner)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: storage('shop'),
    }),
  )
  async createShop(
    @Req() req: AuthReq,
    @Body() dto: { name: string; image: string },
  ) {
    const file = req.file as { path: string };
    const shopData = {
      name: dto.name,
      image: file?.path,
    };
    return this.shopService.createShop(req.user, shopData);
  }
  @Patch('status_shop/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  async statusShop(
    @Param('id') id: string,
    @Body('status') status: 'Accepted' | 'Refused',
  ) {
    if (!isValidObjectId(id)) {
      //هنا بنشيك علي الid
      throw new BadRequestException('Invalid Shop ID');
    }
    if (!['Accepted', 'Refused'].includes(status)) {
      throw new BadRequestException('Status must be Accepted or Refused');
    }
    return this.shopService.changeShopStatus(new Types.ObjectId(id), status);
  }
}
