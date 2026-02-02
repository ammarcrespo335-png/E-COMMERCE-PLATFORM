import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { CouponRepo } from '../../DB/repository/Coupon.repository';
import { CouponEnum } from '../../DB/models/coupon.model';
import { Types } from 'mongoose';
import { ShopRepo } from '../../DB/repository/Shop.repository';
import { request } from 'http';
import { RoleEnum, User } from '../../DB/models/user.model';

@Injectable()
export class CouponService {
  constructor(private readonly couponRepo: CouponRepo,
    private readonly shopRepo: ShopRepo
  ) {}

  async addCoupon(user:User,data: {
    code: string;
    discount: number;
    discountType: CouponEnum;
    startDate: Date;
    expiryDate: Date;
    usageLimit: number;
    usedCount: number;
    isActive: boolean;
    shopId:Types.ObjectId
  }) {
    data.code = data.code.trim().toUpperCase();
    const shop = await this.shopRepo.findOne({ filter: { _id: data.shopId } });
    if (!shop) {
      throw new BadRequestException("shop not found")
    }
  if (user.role!==RoleEnum.SUPER_ADMIN&&user._id.toString()!==shop.createdBy.toString()) {
      throw new ForbiddenException('You are not the owner of this shop to create coupon');
  }
if (shop.shopActivationStatus !== 'Accepted') {
  throw new ForbiddenException('Shop is not verified by SUPER_ADMIN');
}
    const isCouponExist = await this.couponRepo.findOne({
      filter: {
        code: data.code,
        shopId: data.shopId,
      },
    });
    if (isCouponExist) {
      throw new BadRequestException('coupon already exist');
    }
    if (data.startDate >= data.expiryDate) {
      throw new BadRequestException('coupon is finished');
    }
    if (data.discount <= 0) {
      throw new BadRequestException('invalid discount');
    }
    const coupon = await this.couponRepo.create({
      data,
    });

    return {
      msg: 'coupon is created',
      data: coupon,
    };
  }
  async applyCoupon(
    data: { code: string; totalPrice: number },
    isBooking: boolean = false,
  ) {
    const coupon = await this.couponRepo.findOne({
      filter: {
        code: data.code,
        isActive: true,
      },
    });

    if (!coupon) throw new BadRequestException('invalid coupon');
    if (!coupon.isActive) {
      throw new BadRequestException('coupon not Active');
    }
    if (coupon.startDate > new Date()) {
      throw new BadRequestException('coupon not started yet');
    }
    if (coupon.expiryDate < new Date()) {
      throw new BadRequestException('coupon is finished ');
    }

    let discountAmount = 0;
    if (coupon.discountType == CouponEnum.percentage) {
      discountAmount = (data.totalPrice * coupon.discount) / 100;
      discountAmount = Math.round(discountAmount * 100) / 100;
    } else {
      discountAmount = coupon.discount;
    }
    if (isBooking) {
      return {
        discountAmount,
        finalPrice: data.totalPrice - discountAmount,
      };
    }
    if (discountAmount > data.totalPrice) discountAmount = data.totalPrice;
    const updateCoupon = await this.couponRepo.findOneAndUpdate({
      filter: { _id: coupon._id, usedCount: { $lt: coupon.usageLimit } },
      update: { $inc: { usedCount: 1 } },
    });
    if (!updateCoupon) {
      throw new BadRequestException('limit reached');
    }
    return {
      discountAmount,
      finalPrice: data.totalPrice - discountAmount,
    };
  }
}
