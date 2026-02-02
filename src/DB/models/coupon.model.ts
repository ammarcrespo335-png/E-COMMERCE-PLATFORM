import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum CouponEnum {
  percentage = 'percentage',
  fixed = 'fixed',
}
@Schema({
  timestamps: true,
})
export class Coupon {
  @Prop({
    type: String,
    required: true,
  })
  code: string;
  @Prop({
    type: Number,
    required: true,
    default: 10,
  })
  discount: number;
  @Prop({
    type: String,
    enum: Object.values(CouponEnum),
    required: true,
    default: CouponEnum.percentage,
  })
  discountType: CouponEnum;
  @Prop({
    type: Date,
    required: true,
  })
  startDate: Date;
  @Prop({
    type: Date,
    required: true,
  })
  expiryDate: Date;
  @Prop({
    type: Number,
    required: true,
  })
  usageLimit: number;
  @Prop({ type: Number, default: 0 })
  usedCount: number;
  @Prop({ default: true })
  isActive: boolean;
}
export const couponSchema = SchemaFactory.createForClass(Coupon);
couponSchema.index({ code: 1 });
export const couponModel = MongooseModule.forFeature([
  {
    name: Coupon.name,
    schema: couponSchema,
  },
]);
