import { Module } from '@nestjs/common';
import { AdminController } from './admin/admin.controller';
import { AdminService } from './admin/admin.service';

import { SharedModule } from '../shared.module';
import { UserOrderController } from './user/user.controller';
import { UserOrderService } from './user/user.service';
import { UserRepo } from '../../DB/repository/User.repository';
import { ProductRepo } from '../../DB/repository/Products.repository';
import { CartRepo } from '../../DB/repository/Cart.repository';
import { OrderRepo } from '../../DB/repository/Order.repository';
import { couponModule } from '../coupon/coupon.module';

@Module({
  imports: [SharedModule, couponModule],
  controllers: [UserOrderController, AdminController],
  providers: [
    UserOrderService,
    AdminService,
    OrderRepo,
    CartRepo,
    ProductRepo,
    UserRepo,
  ],
  exports: [
    AdminService, 
    OrderRepo,
    UserOrderService 
  ]
})
export class OrdersModule {}
