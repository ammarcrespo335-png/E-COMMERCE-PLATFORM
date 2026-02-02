import { Module } from '@nestjs/common';
import { SharedModule } from '../shared.module';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';

@Module({
  imports: [SharedModule],
  controllers: [CouponController],
  providers: [CouponService],
  exports: [CouponService],
})
export class couponModule {}
