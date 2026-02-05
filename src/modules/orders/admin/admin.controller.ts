import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { AdminService } from './admin.service';
import { OrderStatusEnum } from '../../../DB/models/order.model';
import { Roles } from '../../../common/guards/roles.guard';
import { RoleEnum } from '../../../DB/models/user.model';
import { Types } from 'mongoose';

@Controller('admin-order')
@UseGuards(AuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('getAllOrders')
  @Roles(RoleEnum.ShopOwner)
  async getAllOrders(@Query('status') status?: OrderStatusEnum) {
    const data = await this.adminService.findAllOrders({ status });
    return {
      ...data,
    };
  }
  @Patch('order-status/:orderId')
  @Roles(RoleEnum.ShopOwner)
  async updateStatus(
    @Param('orderId') orderId: Types.ObjectId,
    @Body('status') status: OrderStatusEnum,
  ) {
    const data = await this.adminService.updateOrderStatus(orderId, status);
    return {
      msg: 'Order status updated successfully',
      status: 200,
      data: data,
    };
  }
}
