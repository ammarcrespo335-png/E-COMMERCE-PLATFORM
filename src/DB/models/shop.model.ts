import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNotEmpty } from 'class-validator';
import mongoose, { Types } from 'mongoose';

export enum shopActivationStatus {
  Pending = 'Pending',
  Accepted = 'Accepted',
  Refused = 'Refused',
}
@Schema({
  timestamps: true,
})
export class Shop {
  @Prop({ required: true, trim: true })
  @IsNotEmpty({ message: 'Shop name is required' })
  name: string;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
  @Prop({
    type: String,
    enum: shopActivationStatus,
    default: 'Pending',
  })
  shopActivationStatus: string;

  @Prop()
  image: string;
  @Prop({ default: true })
  isActive: boolean;
}

export const ShopSchema = SchemaFactory.createForClass(Shop);
ShopSchema.index({ name: 1, createdBy: 1 }, { unique: true });

export const ShopModel = MongooseModule.forFeature([
  {
    name: Shop.name,
    schema: Shop,
  },
]);
