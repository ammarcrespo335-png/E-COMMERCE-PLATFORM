import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsEnum,
} from 'class-validator';

import { Type } from 'class-transformer';
import { CouponEnum } from '../../DB/models/coupon.model';
import { Types } from 'mongoose';

export class CouponDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  discount: number;

  @IsEnum(CouponEnum)
  discountType: CouponEnum;

  @Type(() => Date)
  startDate: Date;

  @Type(() => Date)
  expiryDate: Date;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  usageLimit: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  usedCount: number;

  @IsOptional()
  isActive: boolean;
  @IsString()
  shopId :Types.ObjectId;
}
