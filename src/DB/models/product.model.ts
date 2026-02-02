
import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNotEmpty } from 'class-validator';
import mongoose, { Types } from 'mongoose';

export enum CategoryEnum {
  Electronics = 'electronics',
  Fashion = 'fashion',
  Books = 'books',
  Furniture = 'furniture',
  BeautyAndPersonalCare = 'Beauty and personal care',
  MusicAndGames = 'music & games',
  Others = 'others',
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Product {
  @Prop({
    type: String,
    required: true,
    trim: true,
    index: true,
  })
  @IsNotEmpty({ message: 'Category name is required' })
  name: string;
  @Prop({
    type: Types.ObjectId,
    required: true,
    trim: true,
    index: true,
  })
  createdBy: Types.ObjectId;
  @Prop({
    type: String,
    required: true,
    trim: true,
    index: true,
  })
  title: string;
  @Prop({
    type: String,
  })
  description: string;

  @Prop({
    type: Number,
    default: 0,
    min: 0,
  })
  stock: number;
  @Prop({
    type: String,
    enum: CategoryEnum,
    index: true,
  })
  category: string;
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true,
    index: true,
  })
  shopId: Types.ObjectId;
  @Prop({
    type: [String],
    default: [],
  })
  image: string[];
  @Prop({ default: true })
  isActive: boolean;
  @Prop({
    type: Number,
    required: true,
  })
  originalPrice: number;
  @Prop({ type: Number, default: 0 })
  discount: number;
  @Prop({ type: Number })
  salePrice: number;
}

export const productSchema = SchemaFactory.createForClass(Product);
productSchema.pre('save', function () {
  //الكود د يخص ان المنتج ميتخزنش ف الداتا بيز الا و هومحسوب  بالدقه ميحسبش السعر الا لو الادمن اللي مكريت البرودكت يغير السعر
  if (this.isModified('originalPrice') || this.isModified('discount')) {
    const discountAmount = this.originalPrice * (this.discount / 100 || 0);
    this.salePrice = this.originalPrice - discountAmount;
  }
});
productSchema.index({ name: 1, createdBy: 1, shopId: 1 }, { unique: true });

export const ProductModel = MongooseModule.forFeature([
  {
    name: Product.name,
    schema: productSchema,
  },
]);
