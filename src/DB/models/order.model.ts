import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.model';
import { PaymentEnum } from './payment.model';

export enum OrderStatusEnum {
  PendingPayment = 'pending_payment',
  Confirmed = 'confirmed',
  Paid = 'paid',
  Shipped = 'shipped',
  OutForDelivery = 'out_for_delivery',
  Delivered = 'delivered',
  Canceled = 'canceled',
}

@Schema()
export class OrderProduct {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true, index: true })
  productId: Types.ObjectId;

  @Prop({ type: Number, required: true, min: 1 })
  quantity: number;

  @Prop({ type: Number, required: true, min: 0 })
  priceAtPurchase: number; // عشان السعر ميضيعش لو المنتج اتغير بعد الشراء
}
export const OrderProductSchema = SchemaFactory.createForClass(OrderProduct);

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Order {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: Types.ObjectId;
  @Prop({
    type: String,
    enum: OrderStatusEnum,
    default: OrderStatusEnum.PendingPayment,
    index: true,
  })
  status: OrderStatusEnum;

  @Prop({
    type: [OrderProductSchema],
    required: true,
    _id: false,
  })
  products: OrderProduct[];
  @Prop({
    type: [
      {
        email: { type: String, required: true },
        phone: { type: String, required: true },
        googleMapUrl: { type: String, required: true },
        addressDetails: { type: String },
      },
    ],
    _id: false,
    required: true,
  })
  shippingAddress: {
    email: string;
    phone: string;
    googleMapUrl: string;
    addressDetails?: string;
  }[];

  @Prop({ type: Number })
  subTotal: number;
  @Prop({ type: Number, default: 0 })
  discount: number;
  @Prop({ type: Number, required: true })
  total: number;
  @Prop({
    type: String,
    enum: PaymentEnum,
    required: true,
  })
  paymentMethod: PaymentEnum;
  @Prop({ type: String })
  couponCode?: string;
  @Prop({ type: Boolean, default: false })
  couponApplied: boolean;
  @Prop({ type: Boolean, default: false, index: true })
  isPaid: boolean;

  @Prop({ type: Date })
  paidAt?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

export const OrderModel = MongooseModule.forFeature([
  {
    name: Order.name,
    schema: OrderSchema,
  },
]);
