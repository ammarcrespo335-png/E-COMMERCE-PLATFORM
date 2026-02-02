import { Controller, Post, Req, UseGuards } from '@nestjs/common';

import { UserOrderService } from './user.service';
import { AuthGuard, type AuthReq } from '../../../common/guards/auth.guard';

@Controller('user-order')
@UseGuards(AuthGuard)
export class UserOrderController {
  constructor(private readonly userOrderService: UserOrderService) {}
  @Post('create-order')
  async createOrder(@Req() req: AuthReq) {
    const userId = req.user._id;
    const orderData = {
      shippingAddress: req.body.addressId,
      paymentMethod: req.body.paymentMethod,
      couponCode: req.body.couponCode,
    };
    return await this.userOrderService.createOrder(userId, orderData);
  }
}
