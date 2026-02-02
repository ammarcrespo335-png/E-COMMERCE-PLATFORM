import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export enum PaymentEnum {
  EWallets = 'E-Wallets',
  PayPal = 'PayPal',
  Cash = 'cash',
  CreditCard = 'credit_card',
}
export enum PaymentStatusEnum {
  Pending = 'pending',
  Completed = 'completed',
  Failed = 'failed',
  Refunded = 'refunded',
}
@Schema({
  timestamps: true,
})
export class Payment {
  @Prop({
    type: Types.ObjectId,
    ref: 'OrderModel',
    required: true,
    index: true,
  })
  orderId: Types.ObjectId;
  @Prop({ type: Number, required: true, min: 0 })
  amount: number;
  @Prop({ type: String, enum: PaymentEnum, required: true })
  paymentMethod: string;
  @Prop({
    type: String,
    enum: PaymentStatusEnum,
    default: PaymentStatusEnum.Pending,
    index: true,
  })
  status: PaymentStatusEnum;
  @Prop({ type: Boolean, default: false })
  confirmed: boolean;
  @Prop({ type: String, default: 'USD', uppercase: true })
  currency: string;
  @Prop({ type: String, unique: true, sparse: true })
  transactionReference: string;


}
export const paymentSchema = SchemaFactory.createForClass(Payment);

export const PaymentModel = MongooseModule.forFeature([
  {
    name: Payment.name,
    schema: paymentSchema,
  },
]);
