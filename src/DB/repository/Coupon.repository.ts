import { Injectable } from '@nestjs/common';
import { DBRepo } from './DB.repository';
import { Coupon } from '../models/coupon.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CouponRepo extends DBRepo<Coupon> {
  constructor(
    @InjectModel(Coupon.name) private readonly couponModel: Model<Coupon>,
  ) {
    super(couponModel);
  }
}
