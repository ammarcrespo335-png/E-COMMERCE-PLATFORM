import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export enum CategoryEnum {
  Electronics = 'electronics',
  Fashion = 'fashion',
  Books = 'books',
  Furniture = 'furniture',
  BeautyAndPersonalCare = 'Beauty and personal care',
  MusicAndGames = 'music & games',
  Others = 'others',
}

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, trim: true })
  @IsNotEmpty({ message: 'Category name is required' })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop()
  image?: string;

  @Prop({ default: true })
  isActive: boolean;
  @Prop({  trim: true })
  @IsNotEmpty({ message: 'Category name is required' })
  keyword:string;
}


export const CategorySchema = SchemaFactory.createForClass(Category);
CategorySchema.index({ name: 1, createdBy: 1 }, { unique: true });

export const CategoryModel = MongooseModule.forFeature([
  {
    name: Category.name,
    schema: Category,
  },
]);
