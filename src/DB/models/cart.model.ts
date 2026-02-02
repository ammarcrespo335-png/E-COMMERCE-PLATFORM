import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
export class CartItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ type: Number, required: true, min: 1, default: 1 })
  quantity: number;
}

const CartItemSchema = SchemaFactory.createForClass(CartItem);
@Schema({
  timestamps: true,
})
export class Cart extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;
  @Prop({
    type: [CartItemSchema],
    default: [],
  })
  items: CartItem[];
  @Prop({ default: true })
  isActive: boolean;
  @Prop({ type: Number, default: 0 })
  totalPrice: number;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

export const cartModel = MongooseModule.forFeature([
  {
    name: Cart.name,
    schema: CartSchema,
  },
]);
