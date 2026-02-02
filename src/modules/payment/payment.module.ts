import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { SharedModule } from '../shared.module';
import { OrdersModule } from '../orders/orders.module';
import { CouponService } from '../coupon/coupon.service';
import { couponModule } from '../coupon/coupon.module';
@Module({
  imports: [SharedModule, OrdersModule, couponModule],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
