import {
  Body,
  Controller,
  ForbiddenException,
  Post,
  Req,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { UserRepo } from '../../DB/repository/User.repository';
import { CouponService } from './coupon.service';
import { AuthGuard, AuthReq } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CouponDto } from './coupon.dto';
import { RoleEnum } from '../../DB/models/user.model';

export const Roles = (...roles: RoleEnum[]) => SetMetadata('roles', roles);
@Controller('coupon')
@UseGuards(AuthGuard, RolesGuard)
export class CouponController {
  constructor(
    private readonly couponService: CouponService,
  
  ) {}
  @Post('addCoupon')
  @Roles(RoleEnum.ShopOwner)
  async addCoupon(@Body() body: CouponDto, @Req() req: AuthReq) {
    const user = req.user
    const { data } = await this.couponService.addCoupon(user,body);
    return {
      data,
    };
  }
  @Post('applyCoupon')
  async applyCoupon(@Body() body: { code: string; totalPrice: number }) {
    const data = await this.couponService.applyCoupon(body);
    return {
      data,
    };
  }
}
