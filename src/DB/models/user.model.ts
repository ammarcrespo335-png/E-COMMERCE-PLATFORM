import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { Product } from './product.model';

export enum GenderEnum {
  Male = 'male',
  Female = 'female',
}
export enum RoleEnum {
  Admin = 'admin',
  ShopOwner = 'ShopOwner',
  User = 'user',
  SUPER_ADMIN = 'super_admin',
}
@Schema({
  timestamps: true,
})
export class User {
  _id: Types.ObjectId;
  @Prop({
    type: String,
    required: true,
    trim: true,
    index: true,
  })
  Name: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  email: string;
  @Prop({
    type: String,
    required: true,
    select: false,
  })
  password: string;
  @Prop({ type: Number, min: 15 })
  age: number;
  @Prop({
    type: String,
    enum: GenderEnum,
  })
  gender: GenderEnum;

  @Prop({
    type: String,
    enum: RoleEnum,
    default: RoleEnum.User,
  })
  role: RoleEnum;

  @Prop({ type: Boolean, default: false })
  isEmailVerified: boolean;
  @Prop({
    type: {
      otp: { type: String },
      expiredAt: { type: Date },
    },
    default: null,
  })
  passwordOtp?: {
    otp: string;
    expiredAt: Date;
  };
  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: Product.name,
  })
  favorites: Array<Types.ObjectId>;
  @Prop({
    type: [
      {
        email: { type: String, required: true },
        phone: { type: String, required: true },
        googleMapUrl: { type: String, required: true },
        addressDetails: { type: String },
      },
    ],
    required: true,
  })
  shippingAddress: {
    _id: Types.ObjectId;
    email: string;
    phone: string;
    googleMapUrl: string;
    addressDetails?: string;
  }[];
}

export const userSchema = SchemaFactory.createForClass(User);

export const UserModel = MongooseModule.forFeature([
  {
    name: User.name,
    schema: userSchema,
  },
]);
